export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
};

export type RegistrationConfig = {
  enabled: boolean;
  requireEmailVerification: boolean;
  allowedDomains: string[];
  schedule: {
    enabled: boolean;
    startDate: string | null;
    endDate: string | null;
  };
};

export type PlatformSetting = {
  id: string;
  key: string;
  type: 'smtp' | 'registration' | 'system';
  value: SmtpConfig | RegistrationConfig;
  description: string | null;
  validation_schema: any;
  created_at: string;
  updated_at: string;
};