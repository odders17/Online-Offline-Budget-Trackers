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

//Set to variable and get all records from store
const getAll = store.getAll();

//If request successful
getAll.onsuccess = function () {
    //When back online bulk adds items in store
    if (getAll.result.length > 0) {
        fetch('/api/transaction/bulk', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
            },
        })
        .then((response) => response.json())
            .then((res) => {
                if(res.length !== 0) {
                    //With read write access open another transaction
                    transaction = db.transaction(['transactions'], 'readwrite');

                    //Current store assigned to variable
                    const currentStore = transaction.objectStore('transactions');

                    //When bulk add successful clear existing entries
                    currentStore.clear();
                    console.log('Clearing store');
                }
            });
        };
    };
};