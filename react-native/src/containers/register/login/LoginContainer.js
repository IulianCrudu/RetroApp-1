import React, { Component } from 'react'
import { LoginComponent } from '.'
import Constants, { NotificationTypeEnum, ScreenEnum } from '../../../lib/enums'
import { StackActions, NavigationActions } from 'react-navigation'
import { login } from '../../../api/register/login/methods'
import { AsyncStorage } from 'react-native'
import ApiClient from '../../../api/client'
import { Notification } from '../../../components'
import strings from '../../../lib/stringEnums'

class LoginContainer extends Component {
  state = {
    email: '',
    password: '',
    editable: false,
  }

  onChangeEmail = email => {
    this.setState({ email })
  }

  onChangePassword = password => {
    this.setState({ password })
  }

  onPressForgotPassword = () => {
    this.props.navigation.push(ScreenEnum.FORGOT_PASSWORD)
  }

  onPressLogin = () => {
    const { state } = this

    const email = state.email.trim()
    const password = state.password.trim()

    const emailEmpty = !email.length
    const passwordEmpty = !password.length

    if (emailEmpty || passwordEmpty) {
      return Notification.show('Please fill in all inputs', NotificationTypeEnum.ERROR)
    }

    login({ email, password }).then(async ({ data, isOk }) => {
      if (isOk) {
        const { loginMember } = data
        await this.storeToken(loginMember.token)
        await this.storeUserId(loginMember.userId)
        const resetAction = StackActions.reset({
          index: 0,
          actions: [NavigationActions.navigate({ routeName: ScreenEnum.MAIN })]
        })
        this.props.navigation.dispatch(resetAction)
      } else {
        const { message } = data
        if (message.indexOf('email-expected') >= 0) {
          return Notification.show('Email is expected', NotificationTypeEnum.ERROR)
        }
        if (message.indexOf('email-invalid') >= 0) {
          return Notification.show(
            'Please enter a valid email',
            NotificationTypeEnum.ERROR
          )
        }
        if (message.indexOf('Email not used') >= 0) {
          return Notification.show('Email or password wrong')
        }
        return Notification.show(strings.error, NotificationTypeEnum.ERROR)
      }
    })
  }

  storeToken = async token => {
    try {
      await AsyncStorage.setItem(Constants.TOKEN, token)
      ApiClient.setToken(token)
    } catch (err) {
      this.setState({ isLoading: false })
    }
  }

  storeUserId = async userId => {
    try {
      await AsyncStorage.setItem(Constants.USER_ID, userId)
    } catch (err) {
    }
  }

  onPressSignUp = () => {
    this.props.navigation.push(ScreenEnum.SIGN_UP)
  }
  componentDidMount() {
    setTimeout(() => {
      this.setState({ editable: true })
    }, 100)
  }

  render() {
    const { email, password, editable } = this.state

    return (
      <LoginComponent
        editable={editable}
        onChangeEmail={this.onChangeEmail}
        onChangePassword={this.onChangePassword}
        onPressLogin={this.onPressLogin}
        onPressForgotPassword={this.onPressForgotPassword}
        onPressSignUp={this.onPressSignUp}
        email={email}
        password={password}
      />
    )
  }
}

export default LoginContainer
