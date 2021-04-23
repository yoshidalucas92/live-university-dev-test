module.exports = config = {
  "server": process.env.TD_HOST,
  "authentication": {
    "type": "default",
    "options": {
      "userName": process.env.TD_USERNAME,
      "password": process.env.TD_PASSWORD
    }
  },
  "options": {
    "database": process.env.TD_DATABASE,
    "encrypt": false,
    "rowCollectionOnRequestCompletion": true
  }
}