let db;
let budgetVersion;

//For budget database create new db request
const request = indexedDB.open('budget', budgetVersion || 1);

request.onupgradeneeded = function (e) {
    console.log('Upgrade needed in IndexDB');

    const { oldVersion } = e;
    const newVersion = e.newVersion || db.version;

    console.log(`DB Updated from version ${oldVersion} to ${newVersion}`);

    db = e.target.result;

    if (db.objectStoreNames.length === 0) {
        db.createObjectStore('transactions', {autoIncrement: true});
    }
};

request.onerror = function (e) {
    console.log(`Woops! ${e.target.errorCode}`);
};

function checkDatabase() {
    console.log('check db invoked');

//Transaction opened
let transaction = db.transaction(['transactions'], 'readwrite');

//Transactions object access
const store = transaction.objectStore('transactions');