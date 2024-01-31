const process = require("process")
const path = require("path")
var fs = require('fs');

let moduleName = process.argv[2] || ""

if(moduleName == ''){
    process.stderr.write("Module name is required")
    process.exit()
}

let modulePath = path.join(path.dirname(__dirname), "node_modules", moduleName)

let exists = (fs.existsSync(modulePath))
                ? 1
                : 0

              
process.stdout.write(exists)