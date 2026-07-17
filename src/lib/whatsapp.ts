import fs from "fs";
import path from "path";
import crypto from "crypto";

export type WhatsAppEvent =
  | "registration"
  | "login_otp"
  | "payment_success"
  | "payment_failed"
  | "order_confirmation"
  | "license_key_delivery"
  | "software_download"
  | "shipping_update"
  | "delivery_confirmation"
  | "refund_initiated"
  | "refund_completed"
  | "low_stock_alerts"
  | "new_order_notifications"
  | "custom_admin_broadcast";

export interface WhatsAppLogEntry {
  id: string;
  eventType: WhatsAppEvent;
  templateName: string;
  recipientPhone: string;
  variables: string[];
  status: "success" | "failed" | "retrying";
  attempts: number;
  error?: string;
  requestPayload?: any;
  responsePayload?: any;
  timestamp: string;
}

// Default Meta-approved template names
export const DEFAULT_TEMPLATES: Record<WhatsAppEvent, string> = {
  registration: "softkey_welcome_v1",
  login_otp: "softkey_login_otp_v1",
  payment_success: "softkey_payment_success_v1",
  payment_failed: "softkey_payment_failed_v1",
  order_confirmation: "order_confirmation",
  license_key_delivery: "softkey_license_delivery_v1",
  software_download: "softkey_download_v1",
  shipping_update: "softkey_shipping_update_v1",
  delivery_confirmation: "softkey_delivery_confirm_v1",
  refund_initiated: "softkey_refund_init_v1",
  refund_completed: "softkey_refund_complete_v1",
  low_stock_alerts: "softkey_low_stock_alert_v1",
  new_order_notifications: "softkey_new_order_notify_v1",
  custom_admin_broadcast: "order_confirmation",
};

const LOG_FILE = path.join(process.cwd(), "whatsapp_logs_db.json");
const NOTIFICATION_SETTINGS_FILE = path.join(process.cwd(), "notification_settings_db.json");
const TEMPLATE_CACHE_FILE = path.join(process.cwd(), "whatsapp_templates_cache_db.json");

export function saveTemplatesToCache(templates: any[]) {
  try {
    fs.writeFileSync(TEMPLATE_CACHE_FILE, JSON.stringify(templates, null, 2), "utf-8");
  } catch (err) {
    console.error("[WHATSAPP] Failed to write template cache:", err);
  }
}

export function getTemplatesFromCache(): any[] {
  try {
    if (fs.existsSync(TEMPLATE_CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(TEMPLATE_CACHE_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("[WHATSAPP] Failed to read template cache:", err);
  }
  return [];
}

export function getExpectedParamCount(templateName: string): number | null {
  const templates = getTemplatesFromCache();
  const template = templates.find((t: any) => t.name === templateName);
  if (!template) return null;

  let maxParam = 0;
  if (Array.isArray(template.components)) {
    template.components.forEach((c: any) => {
      if (c.text) {
        const matches = c.text.match(/\{\{(\d+)\}\}/g);
        if (matches) {
          matches.forEach((m: string) => {
            const num = parseInt(m.replace(/\D/g, ""), 10);
            if (num > maxParam) maxParam = num;
          });
        }
      }
    });
  }
  return maxParam > 0 ? maxParam : 0;
}

export async function fetchAndCacheTemplatesOnTheFly(): Promise<any[]> {
  const config = getWhatsAppConfig();
  const { whatsappToken, whatsappBusinessId } = config;
  if (!whatsappToken || !whatsappBusinessId) return [];

  try {
    const url = `https://graph.facebook.com/v20.0/${whatsappBusinessId}/message_templates?limit=100`;
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${whatsappToken}`
      }
    });
    const data = await response.json();
    if (response.ok && Array.isArray(data.data)) {
      saveTemplatesToCache(data.data);
      return data.data;
    }
  } catch (err) {
    console.error("[WHATSAPP] On-the-fly template fetch failed:", err);
  }
  return [];
}

let inMemorySettings: any = null;

export function setWhatsAppSettingsInMemory(settings: any) {
  inMemorySettings = settings;
}

// Helper to read notification settings
function readSettings() {
  if (inMemorySettings) {
    return inMemorySettings;
  }
  try {
    if (fs.existsSync(NOTIFICATION_SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(NOTIFICATION_SETTINGS_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("[WHATSAPP] Error reading settings file:", err);
  }
  return {};
}

function cleanConfigValue(val: string | undefined, envVal: string | undefined): string {
  const v = (val || "").trim();
  if (!v || v.startsWith("YOUR_") || v.includes("PLACEHOLDER") || v === "null") {
    return (envVal || "").trim();
  }
  return v;
}

// Get final configuration (Database settings overriding Environment Variables)
export function getWhatsAppConfig() {
  const settings = readSettings();
  
  // Clean values from DB configuration with fallback for placeholders
  const whatsappToken = cleanConfigValue(settings.whatsappToken, process.env.WHATSAPP_API_TOKEN);
  const phoneNumberId = cleanConfigValue(settings.phoneNumberId, process.env.WHATSAPP_PHONE_NUMBER_ID);
  const whatsappBusinessId = cleanConfigValue(settings.whatsappBusinessId, process.env.WHATSAPP_BUSINESS_ID);
  const whatsappLanguage = (settings.whatsappLanguage || process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en").trim();
  
  // Custom templates mapping stored in configuration or falling back to environment variables/defaults
  const customTemplates = settings.whatsappTemplates || {};
  const templates: Record<WhatsAppEvent, string> = { ...DEFAULT_TEMPLATES };
  
  (Object.keys(DEFAULT_TEMPLATES) as WhatsAppEvent[]).forEach((event) => {
    const envVarName = `WHATSAPP_TEMPLATE_${event.toUpperCase()}`;
    const envValue = process.env[envVarName];
    if (customTemplates[event]) {
      templates[event] = customTemplates[event];
    } else if (envValue) {
      templates[event] = envValue.trim();
    }
  });

  return {
    whatsappToken,
    phoneNumberId,
    whatsappBusinessId,
    whatsappLanguage,
    templates,
  };
}

// Save templates configuration back to notification settings
export function saveWhatsAppTemplatesConfig(templates: Partial<Record<WhatsAppEvent, string>>) {
  try {
    let settings: any = {};
    if (fs.existsSync(NOTIFICATION_SETTINGS_FILE)) {
      settings = JSON.parse(fs.readFileSync(NOTIFICATION_SETTINGS_FILE, "utf-8"));
    }
    settings.whatsappTemplates = {
      ...(settings.whatsappTemplates || {}),
      ...templates,
    };
    fs.writeFileSync(NOTIFICATION_SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("[WHATSAPP] Failed to save templates config:", err);
    return false;
  }
}

// Log management
export function getWhatsAppLogs(): WhatsAppLogEntry[] {
  try {
    if (fs.existsSync(LOG_FILE)) {
      return JSON.parse(fs.readFileSync(LOG_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("[WHATSAPP] Error reading logs:", err);
  }
  return [];
}

export function writeWhatsAppLogs(logs: WhatsAppLogEntry[]) {
  try {
    // Keep logs size limited to top 1000 items
    const limitedLogs = logs.slice(0, 1000);
    fs.writeFileSync(LOG_FILE, JSON.stringify(limitedLogs, null, 2), "utf-8");
  } catch (err) {
    console.error("[WHATSAPP] Error writing logs:", err);
  }
}

export function addWhatsAppLog(entry: Omit<WhatsAppLogEntry, "id" | "timestamp">): WhatsAppLogEntry {
  const logs = getWhatsAppLogs();
  const fullEntry: WhatsAppLogEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  logs.unshift(fullEntry); // newest first
  writeWhatsAppLogs(logs);
  return fullEntry;
}

export function updateWhatsAppLog(id: string, updates: Partial<WhatsAppLogEntry>) {
  const logs = getWhatsAppLogs();
  const index = logs.findIndex((l) => l.id === id);
  if (index !== -1) {
    logs[index] = { ...logs[index], ...updates };
    writeWhatsAppLogs(logs);
  }
}

// Clean and format recipient phone number to include standard prefix "91" (unless already formatted)
export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  // If it's a standard Indian 10-digit number, prepend "91"
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

// Dynamic template parameter builders
export function generateTemplateVariables(eventType: WhatsAppEvent, data: any): string[] {
  if (Array.isArray(data)) return data;
  switch (eventType) {
    case "registration":
      return [
        data.name || "Customer",
        data.email || "N/A"
      ];
      
    case "login_otp":
      return [
        data.otp || "000000",
        data.expiry || "5 minutes"
      ];
      
    case "payment_success":
      return [
        data.customerName || "Customer",
        data.orderId || "N/A",
        data.amount || "0.00",
        data.transactionId || "N/A"
      ];
      
    case "payment_failed":
      return [
        data.customerName || "Customer",
        data.orderId || "N/A",
        data.amount || "0.00",
        data.reason || "Transaction declined by issuing bank"
      ];
      
    case "order_confirmation":
      return [
        data.customerName || "Customer",
        data.orderId || "N/A",
        data.items || "N/A",
        data.amount || "0.00"
      ];
      
    case "license_key_delivery":
      return [
        data.customerName || "Customer",
        data.orderId || "N/A",
        data.productName || "Software Product",
        data.licenseKeys || "N/A"
      ];
      
    case "software_download":
      return [
        data.customerName || "Customer",
        data.productName || "Software Product",
        data.downloadUrl || "https://softkey.com/downloads"
      ];
      
    case "shipping_update":
      return [
        data.customerName || "Customer",
        data.orderId || "N/A",
        data.trackingId || "DELIVERY_PARTNER_PENDING",
        data.estDelivery || "2-3 business days"
      ];
      
    case "delivery_confirmation":
      return [
        data.customerName || "Customer",
        data.orderId || "N/A",
        data.deliveredAt || new Date().toLocaleString()
      ];
      
    case "refund_initiated":
      return [
        data.customerName || "Customer",
        data.orderId || "N/A",
        data.amount || "0.00",
        data.timeline || "5-7 bank working days"
      ];
      
    case "refund_completed":
      return [
        data.customerName || "Customer",
        data.orderId || "N/A",
        data.amount || "0.00",
        data.refundId || "N/A"
      ];
      
    case "low_stock_alerts":
      return [
        data.productName || "N/A",
        String(data.currentStock ?? 0),
        String(data.threshold ?? 5)
      ];
      
    case "new_order_notifications":
      return [
        data.orderId || "N/A",
        data.customerName || "Customer",
        data.summary || "N/A"
      ];
      
    default:
      return [];
  }
}

// Helper to generate fallback parameters for the standard approved 'order_confirmation' template
// (which expects exactly 6 parameters: name, amount, orderId, productName, deliveryDetails, helpLink)
export function getFallbackOrderConfirmationVariables(eventType: WhatsAppEvent, variablesData: any): string[] {
  let d = variablesData || {};
  if (Array.isArray(variablesData)) {
    d = {};
    if (eventType === "registration") {
      d.name = variablesData[0];
      d.email = variablesData[1];
    } else if (eventType === "login_otp") {
      d.otp = variablesData[0];
      d.expiry = variablesData[1];
    } else if (eventType === "payment_success") {
      d.customerName = variablesData[0];
      d.orderId = variablesData[1];
      d.amount = variablesData[2];
      d.transactionId = variablesData[3];
    } else if (eventType === "payment_failed") {
      d.customerName = variablesData[0];
      d.orderId = variablesData[1];
      d.amount = variablesData[2];
      d.reason = variablesData[3];
    } else if (eventType === "order_confirmation") {
      d.customerName = variablesData[0];
      d.orderId = variablesData[1];
      d.items = variablesData[2];
      d.amount = variablesData[3];
    } else if (eventType === "license_key_delivery") {
      d.customerName = variablesData[0];
      d.orderId = variablesData[1];
      d.productName = variablesData[2];
      d.licenseKeys = variablesData[3];
    } else if (eventType === "software_download") {
      d.customerName = variablesData[0];
      d.productName = variablesData[1];
      d.downloadUrl = variablesData[2];
    } else if (eventType === "shipping_update") {
      d.customerName = variablesData[0];
      d.orderId = variablesData[1];
      d.trackingId = variablesData[2];
      d.estDelivery = variablesData[3];
    } else if (eventType === "delivery_confirmation") {
      d.customerName = variablesData[0];
      d.orderId = variablesData[1];
      d.deliveredAt = variablesData[2];
    } else if (eventType === "refund_initiated") {
      d.customerName = variablesData[0];
      d.orderId = variablesData[1];
      d.amount = variablesData[2];
      d.timeline = variablesData[3];
    } else if (eventType === "refund_completed") {
      d.customerName = variablesData[0];
      d.orderId = variablesData[1];
      d.amount = variablesData[2];
      d.refundId = variablesData[3];
    } else if (eventType === "low_stock_alerts") {
      d.productName = variablesData[0];
      d.currentStock = variablesData[1];
      d.threshold = variablesData[2];
    } else if (eventType === "new_order_notifications") {
      d.orderId = variablesData[0];
      d.customerName = variablesData[1];
      d.summary = variablesData[2];
    }
  }

  let name = "Customer";
  let amount = "N/A";
  let orderId = "N/A";
  let productName = "Software License";
  let deliveryDetails = "Instant Delivery";
  let link = "https://softkey.com";

  if (eventType === "registration") {
    name = d.name || "Customer";
    amount = "N/A";
    orderId = "REGISTRATION";
    productName = "SoftKey Account Registration";
    deliveryDetails = `Welcome! Your account under email ${d.email || "N/A"} was registered successfully.`;
    link = "https://softkey.com";
  } else if (eventType === "login_otp") {
    name = d.name || "Customer";
    amount = "N/A";
    orderId = "LOGIN_OTP";
    productName = "Two-Factor Verification Code";
    deliveryDetails = `Your One-Time Password (OTP) is: ${d.otp || "000000"}. Expiring in ${d.expiry || "5 minutes"}.`;
    link = "https://softkey.com";
  } else if (eventType === "payment_success") {
    name = d.customerName || d.name || "Customer";
    amount = d.amount || "N/A";
    orderId = d.orderId || "N/A";
    productName = "Payment Successful";
    deliveryDetails = `Transaction ID: ${d.transactionId || "N/A"}. Order is confirmed.`;
    link = "https://softkey.com";
  } else if (eventType === "payment_failed") {
    name = d.customerName || d.name || "Customer";
    amount = d.amount || "0.00";
    orderId = d.orderId || "N/A";
    productName = "Payment Attempt Failed";
    deliveryDetails = `Reason: ${d.reason || "Declined by bank"}. Please try again.`;
    link = "https://softkey.com";
  } else if (eventType === "order_confirmation") {
    name = d.customerName || d.name || "Customer";
    amount = d.amount || "0.00";
    orderId = d.orderId || "N/A";
    productName = d.items || "Catalog Purchase";
    deliveryDetails = "Order is confirmed. License keys and download instructions are sent.";
    link = "https://softkey.com";
  } else if (eventType === "license_key_delivery") {
    name = d.customerName || d.name || "Customer";
    amount = "N/A";
    orderId = d.orderId || "N/A";
    productName = d.productName || "License Key Delivery";
    deliveryDetails = `Keys: ${d.licenseKeys || "N/A"}`;
    link = "https://softkey.com";
  } else if (eventType === "software_download") {
    name = d.customerName || d.name || "Customer";
    amount = "N/A";
    orderId = "DOWNLOAD";
    productName = d.productName || "Software Product";
    deliveryDetails = `Download Link: ${d.downloadUrl || "https://softkey.com/downloads"}`;
    link = d.downloadUrl || "https://softkey.com";
  } else if (eventType === "shipping_update") {
    name = d.customerName || d.name || "Customer";
    amount = "N/A";
    orderId = d.orderId || "N/A";
    productName = "Physical Product Shipping";
    deliveryDetails = `Tracking ID: ${d.trackingId || "PENDING"} (${d.estDelivery || "2-3 business days"})`;
    link = "https://softkey.com";
  } else if (eventType === "delivery_confirmation") {
    name = d.customerName || d.name || "Customer";
    amount = "N/A";
    orderId = d.orderId || "N/A";
    productName = "Product Delivered";
    deliveryDetails = `Status: Marked as Delivered at ${d.deliveredAt || new Date().toLocaleString()}`;
    link = "https://softkey.com";
  } else if (eventType === "refund_initiated") {
    name = d.customerName || d.name || "Customer";
    amount = d.amount || "0.00";
    orderId = d.orderId || "N/A";
    productName = "Refund Initiated";
    deliveryDetails = `Estimated Timeline: ${d.timeline || "5-7 bank working days"}`;
    link = "https://softkey.com";
  } else if (eventType === "refund_completed") {
    name = d.customerName || d.name || "Customer";
    amount = d.amount || "0.00";
    orderId = d.orderId || "N/A";
    productName = "Refund Completed";
    deliveryDetails = `Refund Transaction ID: ${d.refundId || "N/A"}`;
    link = "https://softkey.com";
  } else if (eventType === "low_stock_alerts") {
    name = "Administrator";
    amount = "N/A";
    orderId = "LOW_STOCK";
    productName = d.productName || "Product Alert";
    deliveryDetails = `Current Stock Level: ${d.currentStock ?? 0} (Threshold: ${d.threshold ?? 5})`;
    link = "https://softkey.com";
  } else if (eventType === "new_order_notifications") {
    name = "Administrator";
    amount = "N/A";
    orderId = d.orderId || "N/A";
    productName = "New Order Notification";
    deliveryDetails = `Customer: ${d.customerName || "Customer"}. Summary: ${d.summary || "N/A"}`;
    link = "https://softkey.com";
  }

  return [name, amount, orderId, productName, deliveryDetails, link];
}

// Robust WhatsApp template dispatcher with backoff retries and database logging
export async function dispatchWhatsAppTemplate(
  eventType: WhatsAppEvent,
  recipientPhone: string,
  variablesData: any,
  maxRetries = 3
): Promise<{ success: boolean; error?: string; logId: string }> {
  const config = getWhatsAppConfig();
  const { whatsappToken, phoneNumberId, templates, whatsappLanguage } = config;
  let templateName = templates[eventType] || DEFAULT_TEMPLATES[eventType];
  
  // Pre-emptive check: If template cache is populated, and templateName is not in the approved cache list,
  // silently fallback to "order_confirmation" to prevent API error #132001
  const approvedTemplates = getTemplatesFromCache();
  if (approvedTemplates.length > 0) {
    const isApproved = approvedTemplates.some(
      (t: any) => t.name === templateName && t.status === "APPROVED"
    );
    if (!isApproved && templateName !== "order_confirmation") {
      const isEligibleForFallback = 
        eventType === "order_confirmation" || 
        eventType === "license_key_delivery" || 
        eventType === "payment_success" || 
        eventType === "new_order_notifications";
      
      if (isEligibleForFallback) {
        console.log(`[WHATSAPP-PREEMPTIVE-FALLBACK] Template '${templateName}' is not approved/found in the cache. Silently routing to approved 'order_confirmation'...`);
        templateName = "order_confirmation";
      } else {
        console.warn(`[WHATSAPP-PREEMPTIVE-BYPASS] Template '${templateName}' is not approved, and event '${eventType}' is not eligible for 'order_confirmation' fallback. Skipping template dispatch to prevent confusing messages.`);
        return { success: false, error: `Template '${templateName}' not approved, and fallback is disabled for '${eventType}'.`, logId: "N/A" };
      }
    }
  }
  
  const formattedPhone = formatPhoneNumber(recipientPhone);
  let variables = generateTemplateVariables(eventType, variablesData);

  // Dynamically resolve parameter counts for this template name
  let expectedCount = getExpectedParamCount(templateName);
  if (expectedCount === null && whatsappToken && config.whatsappBusinessId) {
    // Try on-the-fly fetch to populate cache
    const fetched = await fetchAndCacheTemplatesOnTheFly();
    if (fetched.length > 0) {
      expectedCount = getExpectedParamCount(templateName);
    }
  }

  // If the template is 'order_confirmation' (either by default or because of our fallback),
  // we should always populate the 6 fully descriptive variables!
  if (templateName === "order_confirmation") {
    expectedCount = 6;
    variables = getFallbackOrderConfirmationVariables(eventType, variablesData);
  }

  if (expectedCount !== null) {
    if (variables.length < expectedCount) {
      while (variables.length < expectedCount) {
        variables.push("N/A");
      }
    } else if (variables.length > expectedCount) {
      variables = variables.slice(0, expectedCount);
    }
  }

  // Ensure that no element in the variables array is empty or falsy to comply with Meta Cloud API validation
  variables = variables.map((v, index) => {
    if (!v || String(v).trim() === "") {
      if (expectedCount === 6) {
        if (index === 4) return "Instant Digital Delivery";
        if (index === 5) return "https://softkey.com";
      }
      return "N/A";
    }
    return v;
  });
  
  // Backend Verification
  if (!formattedPhone) {
    const error = "Failed dispatch: Invalid or empty recipient phone number.";
    const log = addWhatsAppLog({
      eventType,
      templateName,
      recipientPhone,
      variables,
      status: "failed",
      attempts: 1,
      error,
    });
    return { success: false, error, logId: log.id };
  }

  if (!whatsappToken || !phoneNumberId) {
    const error = "Meta credentials missing: Please configure WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID in env/settings.";
    // Still log the failure to allow audit
    const log = addWhatsAppLog({
      eventType,
      templateName,
      recipientPhone: formattedPhone,
      variables,
      status: "failed",
      attempts: 1,
      error,
    });
    return { success: false, error, logId: log.id };
  }

  // Construct official Meta Cloud API template payload
  const parameters = variables.map((v) => ({
    type: "text" as const,
    text: String(v).replace(/\r?\n/g, " | "), // Clean newlines to avoid Meta API rejection!
  }));

  let templateLanguage = whatsappLanguage || "en";
  if (approvedTemplates && approvedTemplates.length > 0) {
    const cachedTemplate = approvedTemplates.find(
      (t: any) => t.name === templateName && t.status === "APPROVED"
    );
    if (cachedTemplate && cachedTemplate.language) {
      templateLanguage = cachedTemplate.language;
    }
  }

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: formattedPhone,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: templateLanguage,
      },
      components: [
        {
          type: "body",
          parameters,
        },
      ],
    },
  };

  // Add initial "retrying" log, then update as we proceed
  const log = addWhatsAppLog({
    eventType,
    templateName,
    recipientPhone: formattedPhone,
    variables,
    status: "retrying",
    attempts: 0,
    requestPayload: payload,
  });

  const waUrl = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
  let attempt = 0;
  let success = false;
  let lastError = "";
  let responsePayload: any = null;

  while (attempt < maxRetries && !success) {
    attempt++;
    try {
      console.log(`[WHATSAPP-DISPATCH] Attempt ${attempt}/${maxRetries} to send template ${templateName} to ${formattedPhone}`);
      const res = await fetch(waUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${whatsappToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const rawText = await res.text();
      try {
        responsePayload = JSON.parse(rawText);
      } catch {
        responsePayload = { rawText };
      }

      if (res.ok && responsePayload && !responsePayload.error) {
        success = true;
        console.log(`[WHATSAPP-DISPATCH] Success! Msg ID:`, responsePayload.messages?.[0]?.id);
      } else {
        lastError = responsePayload.error?.message || responsePayload.error || JSON.stringify(responsePayload);

        // Check if the template does not exist in their translation (Error Code 132001) or if param mismatch occurred (Error Code 132000)
        const isTemplateMissingError = 
          responsePayload?.error?.code === 132001 || 
          lastError.includes("does not exist") || 
          lastError.includes("Template name does not exist");

        const isParamMismatchError =
          responsePayload?.error?.code === 132000 ||
          lastError.includes("parameters does not match") ||
          lastError.includes("expected number of params");

        const isEligibleForFallback = 
          eventType === "order_confirmation" || 
          eventType === "license_key_delivery" || 
          eventType === "payment_success" || 
          eventType === "new_order_notifications";
        const willFallback = isEligibleForFallback && (isTemplateMissingError || isParamMismatchError) && payload.template.name !== "order_confirmation";

        if (willFallback) {
          console.log(`[WHATSAPP-DISPATCH] Primary template ${templateName} not found or mismatch. Initiating fallback template flow...`);
        } else {
          console.warn(`[WHATSAPP-DISPATCH] Primary attempt ${attempt} returned:`, lastError);
        }

        if (willFallback) {
          console.log(`[WHATSAPP-FALLBACK] Template '${payload.template.name}' needs fallback. Routing to approved 'order_confirmation' template...`);
          
          let fallbackVars = getFallbackOrderConfirmationVariables(eventType, variablesData);
          
          let fallbackCount = getExpectedParamCount("order_confirmation");
          if (fallbackCount === null && whatsappToken && config.whatsappBusinessId) {
            const fetched = await fetchAndCacheTemplatesOnTheFly();
            if (fetched.length > 0) {
              fallbackCount = getExpectedParamCount("order_confirmation");
            }
          }
          if (fallbackCount === null || fallbackCount <= 0) {
            fallbackCount = 6; // default fallback count
          }

          if (fallbackVars.length < fallbackCount) {
            while (fallbackVars.length < fallbackCount) {
              fallbackVars.push("");
            }
          } else if (fallbackVars.length > fallbackCount) {
            fallbackVars = fallbackVars.slice(0, fallbackCount);
          }

          // Ensure no element in fallbackVars is empty or falsy to comply with Meta Cloud API validation
          fallbackVars = fallbackVars.map((v, index) => {
            if (!v || String(v).trim() === "") {
              if (fallbackCount === 6) {
                if (index === 4) return "Instant Digital Delivery";
                if (index === 5) return "https://softkey.com";
              }
              return "N/A";
            }
            return String(v);
          });

          // Construct fresh payload for the fallback to avoid mutating the outer original payload
          const fallbackPayload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: formattedPhone,
            type: "template",
            template: {
              name: "order_confirmation",
              language: {
                code: "en",
              },
              components: [
                {
                  type: "body",
                  parameters: fallbackVars.map((v) => ({
                    type: "text" as const,
                    text: String(v).replace(/\r?\n/g, " | "), // Clean newlines to avoid Meta API rejection!
                  })),
                },
              ],
            },
          };

          console.log(`[WHATSAPP-FALLBACK] Retrying with fresh 'order_confirmation' template payload...`);
          try {
            const fallbackRes = await fetch(waUrl, {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${whatsappToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(fallbackPayload),
            });

            const fallbackRawText = await fallbackRes.text();
            let fallbackResponse: any;
            try {
              fallbackResponse = JSON.parse(fallbackRawText);
            } catch {
              fallbackResponse = { rawText: fallbackRawText };
            }

            if (fallbackRes.ok && fallbackResponse && !fallbackResponse.error) {
              success = true;
              responsePayload = fallbackResponse;
              console.log(`[WHATSAPP-FALLBACK] Fallback delivery successful! Msg ID:`, responsePayload.messages?.[0]?.id);
              break;
            } else {
              const fallbackErr = fallbackResponse?.error?.message || fallbackResponse?.error || JSON.stringify(fallbackResponse);
              console.warn(`[WHATSAPP-FALLBACK] Fallback attempt also failed:`, fallbackErr);
              lastError = `Fallback failed: ${fallbackErr} (Original error: ${lastError})`;
              responsePayload = fallbackResponse; // Capture actual fallback failure JSON for database log!
            }
          } catch (fallbackErr: any) {
            console.error(`[WHATSAPP-FALLBACK] Connection error during fallback:`, fallbackErr);
            lastError = `Fallback connection error: ${fallbackErr.message} (Original error: ${lastError})`;
          }
        }
      }
    } catch (err: any) {
      lastError = err.message;
      console.error(`[WHATSAPP-DISPATCH] Connection error on attempt ${attempt}:`, err);
    }

    if (!success && attempt < maxRetries) {
      // Exponential backoff: 500ms, 1000ms, 2000ms...
      const delay = Math.pow(2, attempt) * 250;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // Update final logs status
  const finalStatus = success ? "success" : "failed";
  updateWhatsAppLog(log.id, {
    status: finalStatus,
    attempts: attempt,
    error: success ? undefined : lastError,
    responsePayload,
  });

  return {
    success,
    error: success ? undefined : lastError,
    logId: log.id,
  };
}
