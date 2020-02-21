import React from 'react'
import { View, Text } from 'react-native'
import { ApplicationStyles } from '../../../themes'

const {container, center} = ApplicationStyles

const SignupComponent = () => {
    return (
        <View style={[container, center]}>
            <Text> Sign up Screen </Text>
        </View>
    )
}

export default SignupComponent
