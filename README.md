# netlify-cms-widget-multiple-relation
Netlify cms Multiple relation widget

This widget is meant to help does who want to select through more then one collation at Relation widget of netlify cms

How to use:

1. In script on your page you have to add this code:
<script>
    CMS.registerWidget('multiple-relation', MultipleRelationControl, MultipleRelationPreview)
</script>

2. Use it in config.yml

- label: 'Sections'
  name: 'section'
  widget: 'multiple-relation'
  options:
    - { label: "Section title", value: "collations" }
  searchFields: ['title']
  displayFields: ['title']
  valueField: 'title'

If you want to add an extra option to the relation you can add it like this

- label: 'Sections'
  name: 'section'
  widget: 'multiple-relation'
  options:
    - { label: "Section title", value: "collations" }
    - label: "Section 1 title"
      value: "collations1"
      extraOptionName: 'extraOptionName'
      extraOptions:
        - { label: "Value1", value: "value" }
        - { label: "Value2", value: "value2" }
  searchFields: ['title']
  displayFields: ['title']
  valueField: 'title'