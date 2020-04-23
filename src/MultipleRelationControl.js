import React from "react";
import PropTypes from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import Select from "react-select";

function optionToString(option) {
  return option && option.value ? option.value : "";
}
function optionToJson(option, relation) {
  return option && option.value && relation && relation.value
    ? { label: relation.value, value: option.value }
    : "";
}
function getSelectedValue(value, options) {
  for (let index in options) {
    if (options[index].value == value) {
      return options[index];
    }
  }
  return '';
}
function convertToOption(raw) {
  if (typeof raw === "string") {
    return { label: raw, value: raw };
  }
  return { label: raw.get("label"), value: raw.get("value") };
}

export default class RelationControl extends React.Component {
  didInitialSearch = false;
  initSelect = false;
  initSet = false;
  placeholder = "Select ...";
  allOptions = [];
  valueCollation = { label: "", value: "" };
  collectionName = { label: "", value: "" };
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    forID: PropTypes.string.isRequired,
    value: PropTypes.node,
    field: ImmutablePropTypes.map,
    fetchID: PropTypes.string,
    query: PropTypes.func.isRequired,
    queryHits: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    classNameWrapper: PropTypes.string.isRequired,
    setActiveStyle: PropTypes.func.isRequired,
    setInactiveStyle: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    const { field, value} = props;
    if (typeof value == "object" && value != null) {
      const fieldOptions = field.get("options");
      const optionsCollation = [...fieldOptions.map(convertToOption)];
      let getVal = "";
      try {
        getVal = value.get("label");
      } catch (Error) {
        getVal = value.label;
      }
      this.valueCollation = getSelectedValue(getVal, optionsCollation);
    }
    if (this.initSelect == false) {
      this.reloadOptions();
    }
  }
  shouldComponentUpdate(nextProps) {
    return (
      this.props.value !== nextProps.value ||
      this.props.hasActiveStyle !== nextProps.hasActiveStyle ||
      this.props.queryHits !== nextProps.queryHits
    );
  }

  componentDidUpdate() {
    /**
     * Load extra post data into the store after first query.
     */
    if (this.didInitialSearch) return;
  }
  handleChangeCollection = (selectedOption) => {
    const { onChange } = this.props;
    this.valueCollation = selectedOption;
    onChange(optionToString(selectedOption));
    this.collectionName = [];
    this.reloadOptions();
  };

  handleChange = (selectedOption) => {
    const { onChange } = this.props;
    let value;
    this.collectionName = selectedOption;
    value = optionToJson(this.collectionName, this.valueCollation);
    onChange(value);
  };

  parseNestedFields = (targetObject, field) => {
    const nestedField = field.split(".");
    let f = targetObject;
    for (let i = 0; i < nestedField.length; i++) {
      f = f[nestedField[i]];
      if (!f) break;
    }
    if (typeof f === "object" && f !== null) {
      return JSON.stringify(f);
    }
    return f;
  };

  parseHitOptions = (hits) => {
    const { field } = this.props;
    const valueField = field.get("valueField");
    const displayField = field.get("displayFields") || field.get("valueField");

    return hits.map((hit) => {
      let labelReturn;
      labelReturn = displayField
        .toJS()
        .map((key) => this.parseNestedFields(hit.data, key))
        .join(" ");
      return {
        value: this.parseNestedFields(hit.data, valueField),
        label: labelReturn,
      };
    });
  };
  reloadOptions = () => {
    const { field, query, forID, onChange } = this.props;
    let { value } = this.props;
    const collection = this.valueCollation.value;
    const searchFields = field.get("searchFields");
    const searchFieldsArray = searchFields.toJS();
    this.allOptions = [];
    this.placeholder = "Loading options";
    this.forceUpdate();
    query(forID, collection, searchFieldsArray, "").then(({ payload }) => {
      let options =
        payload.response && payload.response.hits
          ? this.parseHitOptions(payload.response.hits)
          : [];

      this.allOptions = options;
      if (
        typeof value == "object" &&
        value != undefined &&
        !this.initSelect &&
        this.allOptions.length != 0
      ) {
        let getVal = "";
        try {
          getVal = value.get("value");
        } catch (Error) {
          getVal = value.value;
        }
        this.collectionName = getSelectedValue(getVal, this.allOptions);
        this.initSelect = true;
        value = optionToJson(
          this.collectionName,
          this.valueCollation
        );
        onChange(value);
      }
      this.placeholder = "Select ...";
      this.forceUpdate();
    });
  };

  render() {
    const {
      field,
      forID,
      setActiveStyle,
      setInactiveStyle,
      value,
    } = this.props;
    const fieldOptions = field.get("options");
    if (!fieldOptions) {
      return (
        <div>
          Error rendering select control for {field.get("name")}: No options
        </div>
      );
    }
    const optionsCollation = [...fieldOptions.map(convertToOption)];
    return (
      <div>
        <Select
          value={this.valueCollation}
          options={optionsCollation}
          onFocus={setActiveStyle}
          onBlur={setInactiveStyle}
          onChange={this.handleChangeCollection}
        />
        <Select
          value={this.collectionName}
          inputId={forID}
          onChange={this.handleChange}
          onFocus={setActiveStyle}
          onBlur={setInactiveStyle}
          options={this.allOptions}
          placeholder={this.placeholder}
        />
      </div>
    );
  }
}
