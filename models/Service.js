const mongoose = require("mongoose");

const ServiceSchema = mongoose.Schema({
	id: {
		type: String,
		required: true,
		unique: true,
	},
	name: {
		type: String,
		required: true
	},
	email: {
		type: String, 
		required: true
	},
	address: {
		type: String,
		required: true
	},
	wallet: {
		type: String,
		required: true,
		unique: true
	},
	key: {
		type: String, 
		required: true,
		unique: true
	},
	type: {
		type: String,
		required: true,
	},
	message: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	hashes: {
		type: Array,
		default: []
	}
});

module.exports = mongoose.model("Service", ServiceSchema);