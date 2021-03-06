import React, { useEffect } from 'react'
import {
  connectWithRedux,
  menuControl,
  MENU_PLAYLISTS,
  MENU_PLAYBACKRATE,
  MENU_SETTING,
  MENU_SCREEN_MODE,
  MENU_DOWNLOAD,
  MENU_LANGUAGE,
  MENU_SHORTCUTS,
  MENU_BEFORE_HIDE,
} from '../../Utils'
import PlaylistsMenu from './PlaylistsMenu'
import PlaybackrateMenu from './PlaybackrateMenu'
import ScreenModeMenu from './ScreenModeMenu'
import SettingMenu from './SettingMenu'
import LanguageMenu from './LanguageMenu'
import DownloadMenu from './DownloadMenu'
import ShortcutsTable from './ShortcutsTable'
import './index.css'

export function MenusWithRedux({
  menu,
  setMenu
}) {

  // Register setMenu to menuControl
  useEffect(() => {
    menuControl.register({ setMenu })
  }, [])
  const closeMenu = () => menuControl.close()

  // const hideBefore = menu === MENU_BEFORE_HIDE

  return (
    <div className={`watch-menus`} data-menu-type={menu}>
      <div className="watch-menu-blur" aria-hidden="true" ></div>
      <PlaylistsMenu 
        show={menu === MENU_PLAYLISTS}  
        onClose={closeMenu}
      />
      <PlaybackrateMenu
        show={menu === MENU_PLAYBACKRATE}  
        onClose={closeMenu}
      />
      <ScreenModeMenu 
        show={menu === MENU_SCREEN_MODE}
        onClose={closeMenu}
      />
      <SettingMenu 
        show={menu === MENU_SETTING}
        onClose={closeMenu}
      />
      <LanguageMenu
        show={menu === MENU_LANGUAGE}
        onClose={closeMenu}
      />
      <DownloadMenu
        show={menu === MENU_DOWNLOAD}
        onClose={closeMenu}
      />
      <ShortcutsTable
        show={menu === MENU_SHORTCUTS}
        onClose={closeMenu}
      />
    </div>
  )
}

export const Menus = connectWithRedux(
  MenusWithRedux,
  ['menu'],
  ['setMenu']
)

