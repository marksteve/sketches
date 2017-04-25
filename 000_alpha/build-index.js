var stream = require('simple-html-index')
stream({ entry: 'bundle.js', title: 'ALPHA' }).pipe(process.stdout)
