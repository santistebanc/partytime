import type * as Party from "partykit/server";
import { GameStateManager } from "./server/GameStateManager";
import { MessageHandler } from "./server/MessageHandler";

export default class RoomServer implements Party.Server {
  private gameStateManager: GameStateManager;
  private messageHandler: MessageHandler;

  constructor(readonly room: Party.Room) {
    this.gameStateManager = new GameStateManager(room);
    this.messageHandler = new MessageHandler(this.gameStateManager, room);
  }

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // Connection handling is managed by GameStateManager
    console.log(`Client connected: ${conn.id}`);
  }

  async onMessage(message: string, sender: Party.Connection) {
    await this.messageHandler.handleMessage(message, sender);
  }

  async onClose(conn: Party.Connection) {
    // Connection cleanup is managed by GameStateManager
    console.log(`Client disconnected: ${conn.id}`);
  }
}
