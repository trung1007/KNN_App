import { Stack, Slot } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Text, StyleSheet } from 'react-native';

const ChatLayout = () => {

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <Slot />

            </SafeAreaView>

        </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'white',
    },
  });

export default ChatLayout