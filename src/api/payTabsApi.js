const app = require('../../server/server');
const parsePhone = require('../helpers/parsePhone');
const COUNTRY_CODES = require('../helpers/const/CountryCodes');

const httpRequest = require('../helpers/makeHttpRequest');

const { generateOrderId } = require('../helpers/addCardOrderId');

const CREATE_PAY_PAGE_URL = 'https://www.paytabs.com/apiv2/create_pay_page';
const GET_PAYMENT_INFO_URL = 'https://www.paytabs.com/apiv2/verify_payment';
const GET_TRANSACTION_INFO_URL = 'https://www.paytabs.com/apiv2/verify_payment_transaction';
const REFUND_TRANSACTION_URL = 'https://www.paytabs.com/apiv2/refund_process';
const CREATE_TRANSACTION_URL = 'https://www.paytabs.com/apiv3/tokenized_transaction_prepare';

const SITE_URL = app.get('payTabsSiteUrl');
const PROCESS_ADD_CARD_URL = app.get('processAddCardUrl');
const SERVER_IP = app.get('serverIp');

const ADD_CARD_TITLE = 'Add card payment';
const ADD_CARD_PRODUCT = 'Add card';
const ADD_CARD_PRICE = 1;
const ADD_CARD_QUANTITY = 1;
const ADD_CARD_CHARGES = 0;
const ADD_CARD_AMOUNT = ADD_CARD_PRICE * ADD_CARD_QUANTITY + ADD_CARD_CHARGES;
const ADD_CARD_DISCOUNT = 0;
const ADD_CARD_REFUND_REASON = 'Add card refund.';

const DEFAULT_CURRENCY = 'USD';
const DEFAULT_CMS = 'none';
const DEFAULT_LANGUAGE = 'English';

const PAY_LESSON_TITLE = 'Lesson payment';
const PAY_LESSON_PRODUCT_NAME = 'Lesson';
const PAY_LESSON_AMOUNT = 10;

async function payTabsRequest(url, data) {
    const email = app.get('payTabsEmail');
    const key = app.get('payTabsKey');
    const dataWithKey = {
        ...data,
        'merchant_email': email,
        'secret_key': key,
    };
    const res = await httpRequest({
        url,
        method: 'POST',
        form: dataWithKey,
    });
    return JSON.parse(res.body);
}

async function chargeNewCard(
    user,
    phone,
    userIp,
    orderId,
    amount = PAY_LESSON_AMOUNT,
    currency = DEFAULT_CURRENCY,
    productName = PAY_LESSON_PRODUCT_NAME,
    title = PAY_LESSON_TITLE,
    ) {
    const processCardWithId = `${PROCESS_ADD_CARD_URL}/${orderId}`;
    const countryCode = COUNTRY_CODES.find(c => c['alpha-3'] === user.countryCode);
    const parsedPhone = parsePhone(phone, countryCode['alpha-2']);

    const data = {
        'title': title,
        'reference_no': orderId,
        'cc_first_name': user.firstName,
        'shipping_first_name': user.firstName,
        'cc_last_name': user.lastName,
        'shipping_last_name': user.lastName,
        'cc_phone_number': parsedPhone.countryCallingCode,
        'phone_number': parsedPhone.nationalNumber,
        'email': user.email,
        'country': user.countryCode,
        'country_shipping': user.countryCode,
        'state': user.state,
        'state_shipping': user.state,
        'city': user.city,
        'city_shipping': user.city,
        'billing_address': user.address,
        'address_shipping': user.address,
        'postal_code': user.postalCode,
        'postal_code_shipping': user.postalCode,
        'ip_customer': userIp,
        'ip_merchant': SERVER_IP,
        'site_url': SITE_URL,
        'return_url': processCardWithId,
        'products_per_title': productName,
        'amount': amount,
        'unit_price': amount,
        'quantity': ADD_CARD_QUANTITY,
        'other_charges': ADD_CARD_CHARGES,
        'discount': ADD_CARD_DISCOUNT,
        'currency': currency,
        'msg_lang': DEFAULT_LANGUAGE,
        'cms_with_version': DEFAULT_CMS,
        'is_tokenization': 'FALSE',
        'is_existing_customer': 'FALSE',
    };
    const res = await payTabsRequest(CREATE_PAY_PAGE_URL, data);
    const link = res['payment_url'];
    if (!link) throw new Error(`Unable create pay page link res data: ${JSON.stringify(res, null, '	')}`);
    return link;
}

async function createAddCardLink(user, phone, userIp) {
    const orderId = generateOrderId(user.id);
    const processCardWithId = `${PROCESS_ADD_CARD_URL}/${orderId}`;
    const countryCode = COUNTRY_CODES.find(c => c['alpha-3'] === user.countryCode);
    const parsedPhone = parsePhone(phone, countryCode['alpha-2']);
    const data = {
        'title': ADD_CARD_TITLE,
        'reference_no': orderId,
        'cc_first_name': user.firstName,
        'shipping_first_name': user.firstName,
        'cc_last_name': user.lastName,
        'shipping_last_name': user.lastName,
        'cc_phone_number': parsedPhone.countryCallingCode,
        'phone_number': parsedPhone.nationalNumber,
        'email': user.email,
        'country': user.countryCode,
        'country_shipping': user.countryCode,
        'state': user.state,
        'state_shipping': user.state,
        'city': user.city,
        'city_shipping': user.city,
        'billing_address': user.address,
        'address_shipping': user.address,
        'postal_code': user.postalCode,
        'postal_code_shipping': user.postalCode,
        'ip_customer': userIp,
        'ip_merchant': SERVER_IP,
        'site_url': SITE_URL,
        'return_url': processCardWithId,
        'products_per_title': ADD_CARD_PRODUCT,
        'unit_price': ADD_CARD_PRICE,
        'quantity': ADD_CARD_QUANTITY,
        'other_charges': ADD_CARD_CHARGES,
        'amount': ADD_CARD_AMOUNT,
        'discount': ADD_CARD_DISCOUNT,
        'currency': DEFAULT_CURRENCY,
        'msg_lang': DEFAULT_LANGUAGE,
        'cms_with_version': DEFAULT_CMS,
        'is_tokenization': 'FALSE',
        'is_existing_customer': 'FALSE',
    };
    const res = await payTabsRequest(CREATE_PAY_PAGE_URL, data);
    const link = res['payment_url'];
    if (!link) throw new Error(`Unable create pay page link res data: ${JSON.stringify(res, null, '	')}`);
    return link;
}

function getPaymentInfo(paymentReference) {
    return payTabsRequest(GET_PAYMENT_INFO_URL, { 'payment_reference': paymentReference });
}

function getTransactionInfo(transactionId) {
    return payTabsRequest(GET_TRANSACTION_INFO_URL, { 'transaction_id': transactionId });
}

function refundTransaction(orderId, transactionId, amount, reason) {
    return payTabsRequest(REFUND_TRANSACTION_URL, {
        'refund_amount': amount,
        'refund_reason': reason,
        'transaction_id': transactionId,
        'order_id': orderId,
    });
}

function refundAddCard(orderId, transactionId) {
    return refundTransaction(orderId, transactionId, ADD_CARD_AMOUNT, ADD_CARD_REFUND_REASON);
}

function chargeCard(
    orderId,
    user,
    card,
    phone,
    productName = PAY_LESSON_PRODUCT_NAME,
    amount = PAY_LESSON_AMOUNT,
    title = PAY_LESSON_TITLE,
    currency = DEFAULT_CURRENCY,
) {
    const chargeData = {
        'title': title,
        'cc_first_name': user.firstName,
        'cc_last_name': user.lastName,
        'order_id': orderId,
        'product_name': productName,
        'customer_email': card.cardEmail,
        'phone_number': phone,
        'amount': amount,
        'currency': currency,
        'address_billing': user.address,
        'state_billing': user.state,
        'city_billing': user.city,
        'postal_code_billing': user.postalCode,
        'country_billing': user.countryCode,
        'pt_token': card.cardToken,
        'pt_customer_email': card.cardEmail,
        'pt_customer_password': card.cardPassword,
    };
    return payTabsRequest(CREATE_TRANSACTION_URL, chargeData);
}

module.exports = {
    chargeNewCard,
    createAddCardLink,
    getPaymentInfo,
    getTransactionInfo,
    refundAddCard,
    chargeCard,
};
