const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
	id: {
		type: Number,
		required: true,
		unique: true
	},
	wallet: {
		type: String,
		required: true,
	},
	key: {
		type: String,
		required: true,
	},
	name: {
		type: String,
		required: true
	},
	mobile: {
		type: Number,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	company: {
		type: String,
		required: true
	},
	model: {
		type: String,
		required: true
	},
	plate: {
		type: String,
		required: true,
		unique: true
	},
	date: {
		type: Date,
		default: Date.now()
	}
});

module.exports = mongoose.model("User", UserSchema);