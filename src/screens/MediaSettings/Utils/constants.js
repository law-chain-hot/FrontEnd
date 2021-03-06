/** Tabs */
export const TAB_EDIT_TRANS = 'trans'
export const TAB_EPUB       = 'epub'
export const TAB_DEFAULT    = TAB_EDIT_TRANS
export const mspTabs = [
  { id: 'msp-tab-' + TAB_EDIT_TRANS, name: 'Transcriptions',  hash: TAB_EDIT_TRANS },
  { id: 'msp-tab-' + TAB_EPUB      , name: 'ePub',           hash: TAB_EPUB },
]

/** Epub */
export const TEXT_SEP = '__TEXT_SEP__'
export const textSepRegex = /__TEXT_SEP__/gi
// epub chapters
export const NEW_CHAPTER = { id: 'msp-new-chapter' }