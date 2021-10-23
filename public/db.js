let db;
let budgetVersion;

//For budget database create new db request
const request = indexedDB.open('budget', 1);

request.onupgradeneeded = function (e) {
    console.log('Upgrade needed in IndexDB');

    // const { oldVersion } = e;
    // const newVersion = e.newVersion || db.version;

    // console.log(`DB Updated from version ${oldVersion} to ${newVersion}`);

    db = e.target.result;
    db.createObjectStore('budget', {autoIncrement: true})
    //  (db.objectStoreNames.length === 0) {
    //     ;
    // }
};

request.onerror = function (e) {
    console.log(`Woops! ${e.target.errorCode}`);
};
function saveRecord (record) {
    console.log('Save record invoked');
    //On db with read write access create transaction
    const transaction = db.transaction(['budget'], 'readwrite');

    //Access transaction object store
    const store = transaction.objectStore('budget');

    //Add record to store 
    store.add(record);
};
function checkDatabase() {
    console.log('check db invoked');

//Transaction opened
let transaction = db.transaction(['budget'], 'readwrite');

//Transactions object access
const store = transaction.objectStore('budget');

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
                    const transaction = db.transaction(['budget'], 'readwrite');

                    //Current store assigned to variable
                    const currentStore = transaction.objectStore('budget');

                    //When bulk add successful clear existing entries
                    currentStore.clear();
                    console.log('Clearing store');
                }
            });
        };
    };
};

request.onsuccess = function (e) {
    console.log('success');
    db = e.target.result;

    //Before readind db checks if app is online
    if (navigator.onLine) {
        console.log('Backend online!');
        checkDatabase();
    }
};

//Add EventListener for when app comes back online
window.addEventListener('online', checkDatabase);