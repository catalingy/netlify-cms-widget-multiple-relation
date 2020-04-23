import Control from './MultipleRelationControl'
import Preview from './MultipleRelationPreview'

if (typeof window !== 'undefined') {
  window.MultipleRelationControl = Control
  window.MultipleRelationPreview = Preview
}

export { Control, Preview }
