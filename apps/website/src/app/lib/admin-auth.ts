import bcrypt from "bcryptjs";
import { generateId, maskEmail } from "@elzatona/utilities";
import { adminConfig, getAdminApiUrl } from "../../../admin.config";
import { getSupabaseClient } from "./get-supabase-client";

// Types
export interface AdminCredential {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: "super_admin" | "admin";
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export interface AdminSession {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "admin";
  token: string;
  expiresAt: Date;
}

export interface AuthResult {
  success: boolean;
  admin?: AdminSession;
  error?: string;
}

export interface AdminCreationResult {
  success: boolean;
  adminId?: string;
  error?: string;
}

export interface AdminDeactivationResult {
  success: boolean;
  error?: string;
}

export class AdminAuthService {
  private static readonly TABLE_NAME = "admin_users";

  /**
   * Initialize admin credentials (one-time setup)
   */
  static async initializeAdminCredentials(
    email: string,
    password: string,
    name: string,
    role: "super_admin" | "admin" = "super_admin",
  ): Promise<AdminCreationResult> {
    try {
      // Check if admin already exists
      const existingAdmin = await this.getAdminByEmail(email);
      if (existingAdmin) {
        return {
          success: false,
          error: "Admin with this email already exists",
        };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(
        password,
        adminConfig.security.saltRounds,
      );

      // Create admin document
      const adminId = this.generateAdminId();
      const adminData = {
        id: adminId,
        email,
        password_hash: passwordHash,
        name,
        role,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      const supabase = getSupabaseClient();
      const { error } = await supabase.from(this.TABLE_NAME).insert(adminData);

      if (error) {
        console.error("Error creating admin:", error);
        return { success: false, error: "Failed to create admin account" };
      }

      console.log(`✅ Admin account created: ${maskEmail(email)} (${role})`);
      return { success: true, adminId };
    } catch (error) {
      console.error("Error initializing admin credentials:", error);
      return { success: false, error: "Failed to create admin account" };
    }
  }

  /**
   * Authenticate admin login
   */
  static async authenticateAdmin(
    email: string,
    password: string,
  ): Promise<AuthResult> {
    try {
      const response = await fetch(getAdminApiUrl("/admin/auth"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        console.log(`✅ Admin authenticated: ${maskEmail(email)}`);
        return { success: true, admin: data.admin };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Error authenticating admin:", error);
      return { success: false, error: "Authentication failed" };
    }
  }

  /**
   * Create new admin account
   */
  static async createAdmin(
    email: string,
    password: string,
    name: string,
    role: "super_admin" | "admin" = "admin",
  ): Promise<AdminCreationResult> {
    try {
      // Check if admin already exists
      const existingAdmin = await this.getAdminByEmail(email);
      if (existingAdmin) {
        return {
          success: false,
          error: "Admin with this email already exists",
        };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(
        password,
        adminConfig.security.saltRounds,
      );

      // Create admin document
      const adminId = this.generateAdminId();
      const adminData = {
        id: adminId,
        email,
        password_hash: passwordHash,
        name,
        role,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      const supabase = getSupabaseClient();
      const { error } = await supabase.from(this.TABLE_NAME).insert(adminData);

      if (error) {
        console.error("Error creating admin:", error);
        return { success: false, error: "Failed to create admin account" };
      }

      console.log(`✅ Admin account created: ${maskEmail(email)} (${role})`);
      return { success: true, adminId };
    } catch (error) {
      console.error("Error creating admin:", error);
      return { success: false, error: "Failed to create admin account" };
    }
  }

  /**
   * Deactivate admin account
   */
  static async deactivateAdmin(
    adminId: string,
  ): Promise<AdminDeactivationResult> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({ is_active: false })
        .eq("id", adminId);

      if (error) {
        console.error("Error deactivating admin:", error);
        return { success: false, error: "Failed to deactivate admin" };
      }

      console.log(`✅ Admin deactivated: ${adminId}`);
      return { success: true };
    } catch (error) {
      console.error("Error deactivating admin:", error);
      return { success: false, error: "Failed to deactivate admin" };
    }
  }

  /**
   * Get all admin accounts
   */
  static async getAllAdmins(): Promise<AdminCredential[]> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error getting all admins:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error getting all admins:", error);
      return [];
    }
  }

  /**
   * Validate admin session
   */
  static async validateSession(session: AdminSession): Promise<boolean> {
    try {
      // Check if session has expired
      if (new Date() > new Date(session.expiresAt)) {
        return false;
      }

      // Verify JWT token via API
      const response = await fetch(getAdminApiUrl("/admin/auth"), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error("Session validation failed:", error);
      return false;
    }
  }

  /**
   * Get admin by email
   */
  private static async getAdminByEmail(
    email: string,
  ): Promise<AdminCredential | null> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select("*")
        .eq("email", email)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error getting admin by email:", error);
      return null;
    }
  }

  /**
   * Update last login timestamp
   */
  private static async updateLastLogin(adminId: string): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      await supabase
        .from(this.TABLE_NAME)
        .update({ last_login: new Date().toISOString() })
        .eq("id", adminId);
    } catch (error) {
      console.error("Error updating last login:", error);
    }
  }

  /**
   * Generate unique admin ID
   */
  private static generateAdminId(): string {
    return `admin_${Date.now()}_${generateId()}`;
  }
}
