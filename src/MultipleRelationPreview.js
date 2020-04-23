import React from 'react';

const RelationPreview = ({ value }) => <div>{(typeof value === 'object' && value != null) ? value.value : ''}</div>;

export default RelationPreview;
