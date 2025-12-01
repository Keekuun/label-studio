import { z } from "zod";
import type { ProviderConfig } from "@humansignal/app-common/blocks/StorageProviderForm/types/provider";
import { IconCloudProviderGCS } from "@humansignal/icons";

export const gcsProvider: ProviderConfig = {
  name: "gcs",
  title: "Google Cloud Storage",
  description: "Configure your Google Cloud Storage connection with all required Label Studio settings",
  icon: IconCloudProviderGCS,
  fields: [
    {
      name: "bucket",
      type: "text",
      label: "Bucket Name",
      required: true,
      schema: z.string().min(1, "Bucket name is required"),
    },
    {
      name: "prefix",
      type: "text",
      label: "Bucket prefix",
      placeholder: "path/to/files",
      schema: z.string().optional().default(""),
      target: "export",
    },
    {
      name: "google_application_credentials",
      type: "password",
      label: "Google Application Credentials",
      description: "Paste the contents of credentials.json in this field OR leave it blank to use ADC.",
      autoComplete: "new-password",
      accessKey: true,
      schema: z.string().optional().default(""), // JSON validation could be added if needed
    },
    {
      name: "google_project_id",
      type: "text",
      label: "Google Project ID",
      description: "Leave blank to inherit from Google Application Credentials.",
      schema: z.string().optional().default(""),
    },
    {
      name: "presign",
      type: "toggle",
      label: "Use pre-signed URLs (On) / Proxy through the platform (Off)",
      description:
        "When pre-signed URLs are enabled, all data bypasses the platform and user browsers directly read data from storage",
      schema: z.boolean().default(true),
      target: "import",
      resetConnection: false,
    },
    {
      name: "presign_ttl",
      type: "counter",
      label: "Expire pre-signed URLs (minutes)",
      min: 1,
      max: 10080,
      step: 1,
      schema: z.number().min(1).max(10080).default(15),
      target: "import",
      resetConnection: false,
      dependsOn: {
        field: "presign",
        value: true,
      },
    },
  ],
  layout: [
    { fields: ["bucket"] },
    { fields: ["prefix"] },
    { fields: ["google_application_credentials"] },
    { fields: ["google_project_id"] },
    { fields: ["presign", "presign_ttl"] },
  ],
};

export default gcsProvider;
