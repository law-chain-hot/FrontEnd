import { api } from '../../utils'

export const initialState = {
  media: api.parseMedia(),
  tab: '',
  epubData: [],
  isSettingEpub: false,
} 