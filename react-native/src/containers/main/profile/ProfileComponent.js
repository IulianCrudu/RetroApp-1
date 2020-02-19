import React from 'react'
import { View, Text } from 'retro-web-native'
import { ApplicationStyles } from '../../../themes'

const {container, center} = ApplicationStyles

const ProfileComponent = () => {
    return (
        <View style={container, center}>
            <Text> Profile Screen </Text>
        </View>
    )
}

export default ProfileComponent
