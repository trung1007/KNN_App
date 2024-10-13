import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";

const Information = () => {
    const navigation = useNavigation()
    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => {
                    navigation.goBack();
                }}
            >
                <AntDesign
                    name="arrowleft"
                    size={24}
                />
            </TouchableOpacity>
            <Text>
                Cao Thanh Trung
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {

    }
})

export default Information