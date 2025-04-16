let account_id, prospect_number, account_name, contact_id, prospect_name, mobile_number, email, product_id, product_unit_price;

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

        // PRODUCT DATA
        const product_response = await ZOHO.CRM.API.getRecord({
            Entity: "Products", approved: "both", RecordID: "3769920000000832254"
        });
        const product_data = product_response.data[0];
        product_id = product_data.id;
        product_unit_price = product_data.Unit_Price;

    } catch (error) {
        console.log(error);
    }
});

async function create_record(event) {
    event.preventDefault();

    const current_date = new Date().toISOString().split('T')[0];
    const shareholder_value = parseInt(document.getElementById("how-many-shareholders").value || "1");

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
        const dealInsertRes = await ZOHO.CRM.API.insertRecord({
            Entity: "Deals",
            APIData: deals_data,
            Trigger: ["workflow"],
        });

        const deal_id = dealInsertRes.data[0].details.id;

        const quotes_data = {
            "Subject": "TLZ Internal - IFZA Pre-approval",
            "Product_Details": [
                {
                    "product": product_id,
                    "quantity": shareholder_value,
                    "discount": shareholder_value * product_unit_price
                }
            ],
            "Account_Name": account_id,
            "Finance_Clearance": true,
            "Process_Clearance": true,
            "Quote_Linked_to_Prospect": true,
            "Valid_Till": current_date,
            "Contact_Name": contact_id,
            "Deal_Name": deal_id,
            "Layout": "3769920000000238501"
        };        

        const quoteInsertRes = await ZOHO.CRM.API.insertRecord({
            Entity: "Quotes",
            APIData: quotes_data,
            Trigger: ["workflow"],
        });
        const quote_id = quoteInsertRes.data[0].details.id;
        const quotes_url = "https://crm.zoho.com/crm/org682300086/tab/Quotes/" +quote_id;
        window.open(quotes_url, '_blank').focus();
        showCustomAlert("Prospect and Quotes record has been created. Please close the form.");

        console.log("Quotes record created successfully:", quoteInsertRes);
    } catch (error) {
        console.error("Error creating records:", error);
    }
}

document.getElementById("record-form").addEventListener("submit", create_record);

ZOHO.embeddedApp.init();