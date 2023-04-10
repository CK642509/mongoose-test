const mongoose = require('mongoose');
const roomSchema = new mongoose.Schema(
  {
    name: String,
    price: {
      type: Number,
      required: [true, "價格必填"]
    },
    rating: Number,
    createAt: {
      type: Date,
      default: Date.now,
      select: false // 隱藏不讓前台 .find() 可以找到
    }
  },
  {
    versionKey: false,
  }
)

const Room = mongoose.model('Room', roomSchema);
// model 有 collection 及 schema 兩個參數。
// Room 在 mongoDB 的命名，會強制將 collections 的開頭轉為小寫，字尾加上 s。
// Room > rooms

module.exports = Room;