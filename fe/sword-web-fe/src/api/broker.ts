import mqtt, {MqttClient} from 'mqtt'
import { useEffect, useRef } from 'react'

export const useMqttSubcription = (topics:string[],onReceive:(topic:string,message:string) => void) => {

    let clientRef = useRef<MqttClient|null>(null)

    useEffect(() => {

        clientRef.current = mqtt.connect(`ws://${process.env.REACT_APP_BROKER_HOST}:${process.env.REACT_APP_BROKER_PORT}/mqtt`)

        clientRef.current.on('connect', () => {

            topics.forEach(topic => clientRef.current?.subscribe(topic))
            
            clientRef.current?.addListener('message',(topic:string,message:Uint8Array) => {

                onReceive(String(topic),String(message))

            })  

        })

        return () => {
            clientRef.current?.removeAllListeners('message')
            clientRef.current?.end()
        } 
        
    }, [topics,onReceive])

    return clientRef?.current

}