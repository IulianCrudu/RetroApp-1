import React, { Component } from 'react'
import * as Permissions from 'expo-permissions'
import * as ImagePicker from 'expo-image-picker'
import { Platform } from 'react-native-web'
import { AsyncStorage, Alert } from 'react-native'

import { ProfileComponent } from '.'
import { OS } from '../../../lib/enums'
import { Notification } from '../../../components'

class ProfileContainer extends Component {
  state = {
    hasPermission: null,
    editable: true,
    userId: null
  }

  componentDidMount() {
    const {params} = this.props.navigation.state

    if (params) {
      this.setState({
        editable: false,
        userId: params.userId
      })
    } else {
      this.cameraSetUp()
    }
  }

  cameraSetUp = async () => {
    let initialStatus = await Permissions.getAsync(Permissions.CAMERA)
    if (initialStatus.status !== 'granted') {
      let askAgainStatus = await Permissions.askAsync(Permissions.CAMERA)
      if (askAgainStatus.status !== 'granted') {
        this.setState({ hasCameraPermission: false })
      } else this.setState({ hasCameraPermission: true })
    } else this.setState({ hasCameraPermission: true })

    initialStatus = await Permissions.getAsync(Permissions.CAMERA_ROLL)
    if (initialStatus.status !== 'granted') {
      let askAgainStatus = await Permissions.askAsync(Permissions.CAMERA_ROLL)
      if (askAgainStatus.status !== 'granted') {
        this.setState({ hasCameraRollPermission: false })
      } else this.setState({ hasCameraRollPermission: true })
    } else this.setState({ hasCameraRollPermission: true })
  }

  takeProfilePicture = async () => {
    Alert.alert("Add photo", "Choose a photo or create one and upload it.", [{
      text: "Camera", onPress: async () => {
        if (
          this.state.hasCameraPermission === false ||
          this.state.hasCameraRollPermission === false
        ) {
        } else {
          let result = await ImagePicker.launchCameraAsync()
          const userId = await AsyncStorage.getItem('userId')
          const photoData = this.createFormData(result, userId)
          this.saveAvatar(photoData)
        }
      }
    }, {
      text: "Library", onPress: async () => {
        if (
          this.state.hasCameraRollPermission === false
        ) {
        } else {
          let result = await ImagePicker.launchImageLibraryAsync()
          const userId = await AsyncStorage.getItem('userId')
          const photoData = this.createFormData(result, userId)
          this.saveAvatar(photoData)
        }
      }
    }, {
      text: "Cancel"
    }])
  }

  saveAvatar(photoData) {
    fetch('http://134.122.68.158:3000/uploadAvatar', {
      method: 'POST',
      body: photoData,
    })
      .then(response => response.json())
      .then(response => {
        this.setState({
          avatarUrl: response.path,
        })
      })
      .catch(error => {
        console.log('upload error', error)
        Notification.error('Something went wrong while uploading the picture')
      })
  }

  createFormData = (photo, userId) => {
    const data = new FormData()
    data.append('photo', {
      name: 'Image',
      type: photo.type,
      uri: Platform.OS === OS.ANDROID ? photo.uri : photo.uri.replace('file://', ''),
    })

    data.append('userId', userId)

    return data
  }

  showEvent = _id => {
    console.log(_id)
  }

  loadMore = listType => {
    console.log(listType)
  }

  onGoBack = () => {
    this.props.navigation.goBack()
  }

  render() {
    const { editable } = this.state
    console.log('editable', editable)
    const events = []
    const totalGoingEvents = events.length
    const totalCreatedEvents = events.length

    return (
      <ProfileComponent
        coverUrl={''}
        avatarUrl={this.state.avatarUrl}
        firstName="vlad"
        lastName="romila"
        goingEvents={events}
        totalGoingEvents={totalGoingEvents}
        createdEvents={events}
        totalCreatedEvents={totalCreatedEvents}
        showEvent={this.showEvent}
        loadMore={this.loadMore}
        navigate={this.props.navigation.navigate}
        takeProfilePicture={this.takeProfilePicture}
        editable={editable}
        onGoBack={this.onGoBack}
      />
    )
  }
}

export default ProfileContainer
