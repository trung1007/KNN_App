import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Image, TouchableOpacity, ScrollView } from 'react-native'
import { useNavigation } from "@react-navigation/native";
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';


const AllChatScreen = () => {

    const navigation = useNavigation()


    const startChatting = () => {
        // @ts-ignore
        navigation.navigate('message')
    }

    return (
        <View style={styles.wrapper}>
            <ScrollView style={styles.boxChat}>
                <TouchableOpacity style={styles.chatUser} onPress={startChatting}>
                    <Image source={require('../../../assets/images/avatar.jpg')} style={styles.avaImg} />
                    <View style={styles.chatInf}>
                        <Text style={styles.userName}>Cao Thanh Trung</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.chatUser} onPress={startChatting}>
                    <Image source={require('../../../assets/images/avatar.jpg')} style={styles.avaImg} />
                    <View style={styles.chatInf}>
                        <Text style={styles.userName}>Cao Thanh Trung</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>

        </View>



    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1
    },
    boxChat:{
        padding:12
    },
    chatUser: {
        display: 'flex',
        flexDirection: 'row',
        marginBottom: 20
    },
    avaImg: {
        height: 64,
        width: 64,
        borderRadius: 32
    },
    chatInf:{
        marginLeft:12,
        borderTopWidth:1,
        borderBottomWidth:1,
        borderColor:"#D0D0D0",
        flex:1
    },
    userName: {
        fontSize: 20
    }
})

export default AllChatScreen