import * as React from 'react'
import { connect } from 'react-redux'
import styled from '@register/styledComponents'
import {
  injectIntl,
  InjectedIntlProps,
  defineMessages,
  InjectedIntl
} from 'react-intl'
import { IToggleMenuItem, ToggleMenu } from '@opencrvs/components/lib/interface'
import {
  SettingsBlack,
  LogoutBlack,
  AvatarSmall
} from '@opencrvs/components/lib/icons'
import { IStoreState } from '@register/store'
import { IUserDetails } from '@register/utils/userUtils'
import { getLanguage } from '@register/i18n/selectors'
import { getUserDetails } from '@register/profile/profileSelectors'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'
import { roleMessages } from '@register/utils/roleTypeMessages'
import { redirectToAuthentication } from '@register/profile/profileActions'
import { goToSettings } from '@register/navigation'

const UserName = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.bigBodyBoldStyle};
  height: 27px;
`

const UserRole = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  height: 24px;
  ${({ theme }) => theme.fonts.captionStyle};
`

const messages = defineMessages({
  settings: {
    id: 'menu.items.settings',
    defaultMessage: 'Settings',
    description: 'Menu item settings'
  },
  logout: {
    id: 'menu.items.logout',
    defaultMessage: 'Log out',
    description: 'Menu item logout'
  }
})

interface IProps {
  language: string
  userDetails: IUserDetails | null
  redirectToAuthentication: typeof redirectToAuthentication
  goToSettings: typeof goToSettings
}

interface IState {
  showLogoutModal: boolean
}

type FullProps = IProps & InjectedIntlProps

class ProfileMenuComponent extends React.Component<FullProps, IState> {
  getMenuItems = (intl: InjectedIntl): IToggleMenuItem[] => {
    const items = [] as IToggleMenuItem[]
    items.push({
      icon: <SettingsBlack />,
      label: intl.formatMessage(messages.settings),
      handler: this.props.goToSettings
    })
    items.push({
      icon: <LogoutBlack />,
      label: intl.formatMessage(messages.logout),
      handler: () => this.props.redirectToAuthentication()
    })
    return items
  }

  getMenuHeader = (
    intl: InjectedIntl,
    language: string,
    userDetails: IUserDetails | null
  ): JSX.Element => {
    let userName
    let userRole

    if (userDetails && userDetails.name) {
      const nameObj = userDetails.name.find(
        (storedName: GQLHumanName | null) => {
          const name = storedName as GQLHumanName
          return name.use === language
        }
      ) as GQLHumanName

      if (nameObj) {
        userName = `${String(nameObj.firstNames)} ${String(nameObj.familyName)}`
      }

      userRole =
        userDetails.role &&
        intl.formatMessage(roleMessages[userDetails.role as string])
    } else {
      userName = ''
      userRole = ''
    }

    return (
      <>
        <UserName>{userName}</UserName>
        <UserRole>{userRole}</UserRole>
      </>
    )
  }

  render() {
    const { intl, language, userDetails } = this.props

    return (
      <>
        <ToggleMenu
          id="ProfileMenu"
          toggleButton={<AvatarSmall />}
          menuHeader={this.getMenuHeader(intl, language, userDetails)}
          menuItems={this.getMenuItems(intl)}
        />
      </>
    )
  }
}

const mapStateToProps = (store: IStoreState) => {
  return {
    language: getLanguage(store),
    userDetails: getUserDetails(store)
  }
}

export const ProfileMenu = connect(
  mapStateToProps,
  {
    redirectToAuthentication,
    goToSettings
  }
)(injectIntl(ProfileMenuComponent))