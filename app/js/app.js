let account_id, prospect_number, account_name, contact_id, prospect_name, mobile_number, email;

function showCustomAlert(message) {
    const alertBox = document.getElementById("custom-alert");
    const alertMessage = alertBox.querySelector("p");
    alertMessage.textContent = message;
    alertBox.classList.remove("hidden");
}

function hideCustomAlert() {
    const alertBox = document.getElementById("custom-alert");
    alertBox.classList.add("hidden");
}


// Initialize ZOHO embedded app
ZOHO.embeddedApp.on("PageLoad", async (entity) => {
    const entity_id = entity.EntityId[0];
    try {
        // ACCOUNTS DATA
        const account_response = await ZOHO.CRM.API.getRecord({
            Entity: "Accounts", approved: "both", RecordID: entity_id
        });
        const account_data = account_response.data[0];
        account_id = account_data.id;
        account_name = account_data.Account_Name;
        contact_id = account_data.Primary_Contact.id;


        // CONTACTS DATA
        const contact_response = await ZOHO.CRM.API.getRecord({
            Entity: "Contacts", approved: "both", RecordID: contact_id
        });
        const contact_data = contact_response.data[0];
        mobile_number = contact_data.Mobile;
        email = contact_data.Email;

        console.log("CONTACTS DATA: ", contact_data);
    } catch (error) {
        console.log(error);
    }
});

async function create_record(event) {
    event.preventDefault();

    const current_date = new Date().toISOString().split('T')[0];

    const deals_data = {
        "Account_Name": account_id,
        "Deal_Name": account_name,
        "Type": "Pre-Approval",
        "Closing_Date": current_date,
        "Stage": "Closed Won",
        "Clearance_for_Dashboard_Commission": true,
        "Clearance_for_Processing": true,
        "Date_Commission_Clearance": current_date,
        "Date_Processing_Clearance": current_date,
        "Contact_Name": contact_id,
        "Email_Address": email,
        "Mobile": mobile_number,
        "Layout": "3769920000000091023",
        "Commission_Amount": 0,
        "Dashboard_Amount": 0
    };

    try {
        const insertResponse = await ZOHO.CRM.API.insertRecord({
            Entity: "Deals",
            APIData: deals_data,
            Trigger: [],
        })
        console.log("Deals record created successfully: ", insertResponse);
    } catch (error) {
        console.error("Error inserting deals record:", error);
    }

    const quotes_data = {
        "Subject": "TLZ Internal - IFZA Pre-approval",
        "Product_Name": "3769920000000832254",
        "Quantity": document.getElementById("how-many-shareholders").value,
        "Finance_Clearance": true,
        "Process_Clearance": true,
        "Quote_Linked_to_Prospect": true,
        "Valid_Till": current_date,
        "Contact_Name": contact_id,
        "Layout": "3769920000000238501"
    };

    try {
        const response = await ZOHO.CRM.API.insertRecord({
            Entity: "Quotes",
            APIData: quotes_data
        });
    
        const quote_data = response.data;
        quote_data.forEach((related_record) => {
            const quote_id = related_record.details.id;
            const quotes_url = "https://crm.zoho.com/crm/org682300086/tab/Quotes/" + quote_id;
            window.open(quotes_url, '_blank').focus();
            showCustomAlert("Application Record created. Please close the form.");
        });
    
        console.log("Quotes record created successfully:", response);
    } catch (error) {
        console.error("Error inserting quotes record:", error);
    }
}

document.getElementById("record-form").addEventListener("submit", create_record);

ZOHO.embeddedApp.init();
