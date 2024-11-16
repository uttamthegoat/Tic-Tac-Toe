// import { Schema, model } from 'mongoose';

// interface IPlayer {
//   username: string;
//   password: string;
//   gamesPlayed: number;
//   gamesWon: number;
// }

// const playerSchema = new Schema<IPlayer>({
//   username: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   gamesPlayed: { type: Number, default: 0 },
//   gamesWon: { type: Number, default: 0 }
// });

// export const Player = model<IPlayer>('Player', playerSchema); 