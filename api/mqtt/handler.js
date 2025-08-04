const mqtt = require('mqtt');
const queries = require('../db/queries');
const mqttHelper=require('../helpers/mqttHelper');
const WebSocket = require('ws');
require('dotenv').config();

class MqttHandler {
  constructor() {
    this.mqttClient = null;
    this.host = process.env.MQTT_HOST;
    this.username = process.env.MQTT_USERNAME;
    this.password = process.env.MQTT_PASSWORD;
    this.clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
  }

  connect() {
    console.log(process.env.WEBSOCKET_PORT);
    const wss = new WebSocket.Server({ port: process.env.WEBSOCKET_PORT });
    let websocketClients = [];
    const host = this.host.startsWith('mqtt://') ? this.host : `mqtt://${this.host}`;
    this.mqttClient = mqtt.connect(host, {
      clientId: this.clientId,
      clean: true,
      connectTimeout: 4000,
      username: this.username,
      password: this.password,
      reconnectPeriod: 1000,
    });

    this.mqttClient.on('error', (err) => {
      console.error('MQTT Error:', err);
   
    });

    this.mqttClient.on('connect', () => {
      console.log('Connected to MQTT broker');
      this.subscribe();
      
      wss.on('connection', (ws) => {
        websocketClients.push(ws);

        ws.on('close', () => {
            websocketClients = websocketClients.filter(c => c !== ws);
        });
      });
    });

    this.mqttClient.on('message', async (topic, message) => {
      try {
        // const data = JSON.parse(message.toString());
        await this.handleMessage(topic, message, this.mqttClient);
        websocketClients.forEach(ws => {
          if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ topic, value: message.toString() }));
          }
      });
      } catch (error) {
        console.error('Error processing MQTT message:', error);
      }
    });
  }

  subscribe() {

    this.mqttClient.subscribe('GVC/SENSORS/ALL', (err) => {
      if (err) {
        console.error('Subscription error:', err);
      } else {
        console.log('Subscribed to GVC/SENSORS/ALL');
      }
    });
    this.mqttClient.subscribe('GVC/KP/ALL', (err) => {
      if (err) {
        console.error('Subscription error:', err);
      } else {
        console.log('Subscribed to GVC/KP/ALL');
      }
    });


  }

  async handleMessage(topic, data,client) {
    try {
      // console.log(data);
        mqttHelper.parse(data,client,topic);
    } catch (error) {
      console.error('Error handling MQTT message:', error);
    }
  }

  publishMessage(topic, message) {
    return new Promise((resolve, reject) => {
      this.mqttClient.publish(topic, JSON.stringify(message), (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = new MqttHandler(); 