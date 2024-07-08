export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      alert_data_processing: {
        Row: {
          catalog_name: string
          evaluation_interval: unknown
        }
        Insert: {
          catalog_name: string
          evaluation_interval: unknown
        }
        Update: {
          catalog_name?: string
          evaluation_interval?: unknown
        }
        Relationships: []
      }
      alert_history: {
        Row: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          arguments: Json
          catalog_name: string
          fired_at: string
          resolved_arguments: Json | null
          resolved_at: string | null
        }
        Insert: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          arguments: Json
          catalog_name: string
          fired_at: string
          resolved_arguments?: Json | null
          resolved_at?: string | null
        }
        Update: {
          alert_type?: Database["public"]["Enums"]["alert_type"]
          arguments?: Json
          catalog_name?: string
          fired_at?: string
          resolved_arguments?: Json | null
          resolved_at?: string | null
        }
        Relationships: []
      }
      alert_subscriptions: {
        Row: {
          catalog_prefix: string
          created_at: string
          detail: string | null
          email: string | null
          id: unknown
          updated_at: string
        }
        Insert: {
          catalog_prefix: string
          created_at?: string
          detail?: string | null
          email?: string | null
          id: unknown
          updated_at?: string
        }
        Update: {
          catalog_prefix?: string
          created_at?: string
          detail?: string | null
          email?: string | null
          id?: unknown
          updated_at?: string
        }
        Relationships: []
      }
      applied_directives: {
        Row: {
          background: boolean
          created_at: string
          detail: string | null
          directive_id: unknown
          id: unknown
          job_status: Json
          logs_token: string
          updated_at: string
          user_claims: Json | null
          user_id: string
        }
        Insert: {
          background?: boolean
          created_at?: string
          detail?: string | null
          directive_id: unknown
          id: unknown
          job_status?: Json
          logs_token?: string
          updated_at?: string
          user_claims?: Json | null
          user_id?: string
        }
        Update: {
          background?: boolean
          created_at?: string
          detail?: string | null
          directive_id?: unknown
          id?: unknown
          job_status?: Json
          logs_token?: string
          updated_at?: string
          user_claims?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applied_directives_directive_id_fkey"
            columns: ["directive_id"]
            isOneToOne: false
            referencedRelation: "directives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applied_directives_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "applied_directives_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_stats: {
        Row: {
          bytes_read_by_me: number
          bytes_read_from_me: number
          bytes_written_by_me: number
          bytes_written_to_me: number
          catalog_name: string
          docs_read_by_me: number
          docs_read_from_me: number
          docs_written_by_me: number
          docs_written_to_me: number
          errors: number
          failures: number
          flow_document: Json
          grain: string
          ts: string
          usage_seconds: number
          warnings: number
        }
        Insert: {
          bytes_read_by_me?: number
          bytes_read_from_me?: number
          bytes_written_by_me?: number
          bytes_written_to_me?: number
          catalog_name: string
          docs_read_by_me?: number
          docs_read_from_me?: number
          docs_written_by_me?: number
          docs_written_to_me?: number
          errors?: number
          failures?: number
          flow_document: Json
          grain: string
          ts: string
          usage_seconds?: number
          warnings?: number
        }
        Update: {
          bytes_read_by_me?: number
          bytes_read_from_me?: number
          bytes_written_by_me?: number
          bytes_written_to_me?: number
          catalog_name?: string
          docs_read_by_me?: number
          docs_read_from_me?: number
          docs_written_by_me?: number
          docs_written_to_me?: number
          errors?: number
          failures?: number
          flow_document?: Json
          grain?: string
          ts?: string
          usage_seconds?: number
          warnings?: number
        }
        Relationships: []
      }
      catalog_stats_daily: {
        Row: {
          bytes_read_by_me: number
          bytes_read_from_me: number
          bytes_written_by_me: number
          bytes_written_to_me: number
          catalog_name: string
          docs_read_by_me: number
          docs_read_from_me: number
          docs_written_by_me: number
          docs_written_to_me: number
          errors: number
          failures: number
          flow_document: Json
          grain: string
          ts: string
          usage_seconds: number
          warnings: number
        }
        Insert: {
          bytes_read_by_me?: number
          bytes_read_from_me?: number
          bytes_written_by_me?: number
          bytes_written_to_me?: number
          catalog_name: string
          docs_read_by_me?: number
          docs_read_from_me?: number
          docs_written_by_me?: number
          docs_written_to_me?: number
          errors?: number
          failures?: number
          flow_document: Json
          grain: string
          ts: string
          usage_seconds?: number
          warnings?: number
        }
        Update: {
          bytes_read_by_me?: number
          bytes_read_from_me?: number
          bytes_written_by_me?: number
          bytes_written_to_me?: number
          catalog_name?: string
          docs_read_by_me?: number
          docs_read_from_me?: number
          docs_written_by_me?: number
          docs_written_to_me?: number
          errors?: number
          failures?: number
          flow_document?: Json
          grain?: string
          ts?: string
          usage_seconds?: number
          warnings?: number
        }
        Relationships: []
      }
      catalog_stats_hourly: {
        Row: {
          bytes_read_by_me: number
          bytes_read_from_me: number
          bytes_written_by_me: number
          bytes_written_to_me: number
          catalog_name: string
          docs_read_by_me: number
          docs_read_from_me: number
          docs_written_by_me: number
          docs_written_to_me: number
          errors: number
          failures: number
          flow_document: Json
          grain: string
          ts: string
          usage_seconds: number
          warnings: number
        }
        Insert: {
          bytes_read_by_me?: number
          bytes_read_from_me?: number
          bytes_written_by_me?: number
          bytes_written_to_me?: number
          catalog_name: string
          docs_read_by_me?: number
          docs_read_from_me?: number
          docs_written_by_me?: number
          docs_written_to_me?: number
          errors?: number
          failures?: number
          flow_document: Json
          grain: string
          ts: string
          usage_seconds?: number
          warnings?: number
        }
        Update: {
          bytes_read_by_me?: number
          bytes_read_from_me?: number
          bytes_written_by_me?: number
          bytes_written_to_me?: number
          catalog_name?: string
          docs_read_by_me?: number
          docs_read_from_me?: number
          docs_written_by_me?: number
          docs_written_to_me?: number
          errors?: number
          failures?: number
          flow_document?: Json
          grain?: string
          ts?: string
          usage_seconds?: number
          warnings?: number
        }
        Relationships: []
      }
      catalog_stats_monthly: {
        Row: {
          bytes_read_by_me: number
          bytes_read_from_me: number
          bytes_written_by_me: number
          bytes_written_to_me: number
          catalog_name: string
          docs_read_by_me: number
          docs_read_from_me: number
          docs_written_by_me: number
          docs_written_to_me: number
          errors: number
          failures: number
          flow_document: Json
          grain: string
          ts: string
          usage_seconds: number
          warnings: number
        }
        Insert: {
          bytes_read_by_me?: number
          bytes_read_from_me?: number
          bytes_written_by_me?: number
          bytes_written_to_me?: number
          catalog_name: string
          docs_read_by_me?: number
          docs_read_from_me?: number
          docs_written_by_me?: number
          docs_written_to_me?: number
          errors?: number
          failures?: number
          flow_document: Json
          grain: string
          ts: string
          usage_seconds?: number
          warnings?: number
        }
        Update: {
          bytes_read_by_me?: number
          bytes_read_from_me?: number
          bytes_written_by_me?: number
          bytes_written_to_me?: number
          catalog_name?: string
          docs_read_by_me?: number
          docs_read_from_me?: number
          docs_written_by_me?: number
          docs_written_to_me?: number
          errors?: number
          failures?: number
          flow_document?: Json
          grain?: string
          ts?: string
          usage_seconds?: number
          warnings?: number
        }
        Relationships: []
      }
      connector_tags: {
        Row: {
          auto_discover_interval: unknown
          background: boolean
          connector_id: unknown
          created_at: string
          detail: string | null
          documentation_url: string | null
          endpoint_spec_schema: Json | null
          id: unknown
          image_tag: string
          job_status: Json
          logs_token: string
          protocol: string | null
          resource_path_pointers: unknown[] | null
          resource_spec_schema: Json | null
          updated_at: string
        }
        Insert: {
          auto_discover_interval?: unknown
          background?: boolean
          connector_id: unknown
          created_at?: string
          detail?: string | null
          documentation_url?: string | null
          endpoint_spec_schema?: Json | null
          id: unknown
          image_tag: string
          job_status?: Json
          logs_token?: string
          protocol?: string | null
          resource_path_pointers?: unknown[] | null
          resource_spec_schema?: Json | null
          updated_at?: string
        }
        Update: {
          auto_discover_interval?: unknown
          background?: boolean
          connector_id?: unknown
          created_at?: string
          detail?: string | null
          documentation_url?: string | null
          endpoint_spec_schema?: Json | null
          id?: unknown
          image_tag?: string
          job_status?: Json
          logs_token?: string
          protocol?: string | null
          resource_path_pointers?: unknown[] | null
          resource_spec_schema?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "connector_tags_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "connectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connector_tags_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "live_specs_ext"
            referencedColumns: ["connector_id"]
          },
        ]
      }
      connectors: {
        Row: {
          created_at: string
          detail: string | null
          external_url: string
          id: unknown
          image_name: string
          logo_url: Json | null
          long_description: Json | null
          oauth2_client_id: string | null
          oauth2_client_secret: string | null
          oauth2_injected_values: Json | null
          oauth2_spec: Json | null
          recommended: boolean
          short_description: Json | null
          title: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          detail?: string | null
          external_url: string
          id: unknown
          image_name: string
          logo_url?: Json | null
          long_description?: Json | null
          oauth2_client_id?: string | null
          oauth2_client_secret?: string | null
          oauth2_injected_values?: Json | null
          oauth2_spec?: Json | null
          recommended: boolean
          short_description?: Json | null
          title?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          detail?: string | null
          external_url?: string
          id?: unknown
          image_name?: string
          logo_url?: Json | null
          long_description?: Json | null
          oauth2_client_id?: string | null
          oauth2_client_secret?: string | null
          oauth2_injected_values?: Json | null
          oauth2_spec?: Json | null
          recommended?: boolean
          short_description?: Json | null
          title?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      directives: {
        Row: {
          catalog_prefix: string
          created_at: string
          detail: string | null
          id: unknown
          spec: Json
          token: string | null
          updated_at: string
          uses_remaining: number | null
        }
        Insert: {
          catalog_prefix: string
          created_at?: string
          detail?: string | null
          id: unknown
          spec: Json
          token?: string | null
          updated_at?: string
          uses_remaining?: number | null
        }
        Update: {
          catalog_prefix?: string
          created_at?: string
          detail?: string | null
          id?: unknown
          spec?: Json
          token?: string | null
          updated_at?: string
          uses_remaining?: number | null
        }
        Relationships: []
      }
      discovers: {
        Row: {
          auto_evolve: boolean
          auto_publish: boolean
          background: boolean
          capture_name: string
          connector_tag_id: unknown
          created_at: string
          detail: string | null
          draft_id: unknown
          endpoint_config: Json
          id: unknown
          job_status: Json
          logs_token: string
          update_only: boolean
          updated_at: string
        }
        Insert: {
          auto_evolve?: boolean
          auto_publish?: boolean
          background?: boolean
          capture_name: string
          connector_tag_id: unknown
          created_at?: string
          detail?: string | null
          draft_id: unknown
          endpoint_config: Json
          id: unknown
          job_status?: Json
          logs_token?: string
          update_only?: boolean
          updated_at?: string
        }
        Update: {
          auto_evolve?: boolean
          auto_publish?: boolean
          background?: boolean
          capture_name?: string
          connector_tag_id?: unknown
          created_at?: string
          detail?: string | null
          draft_id?: unknown
          endpoint_config?: Json
          id?: unknown
          job_status?: Json
          logs_token?: string
          update_only?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discovers_connector_tag_id_fkey"
            columns: ["connector_tag_id"]
            isOneToOne: false
            referencedRelation: "connector_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discovers_connector_tag_id_fkey"
            columns: ["connector_tag_id"]
            isOneToOne: false
            referencedRelation: "live_specs_ext"
            referencedColumns: ["connector_tag_id"]
          },
          {
            foreignKeyName: "discovers_connector_tag_id_fkey"
            columns: ["connector_tag_id"]
            isOneToOne: false
            referencedRelation: "next_auto_discovers"
            referencedColumns: ["connector_tags_id"]
          },
          {
            foreignKeyName: "discovers_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "drafts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discovers_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "drafts_ext"
            referencedColumns: ["id"]
          },
        ]
      }
      draft_errors: {
        Row: {
          detail: string
          draft_id: unknown
          scope: string
        }
        Insert: {
          detail: string
          draft_id: unknown
          scope: string
        }
        Update: {
          detail?: string
          draft_id?: unknown
          scope?: string
        }
        Relationships: [
          {
            foreignKeyName: "draft_errors_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "drafts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draft_errors_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "drafts_ext"
            referencedColumns: ["id"]
          },
        ]
      }
      draft_specs: {
        Row: {
          built_spec: Json | null
          catalog_name: string
          created_at: string
          detail: string | null
          draft_id: unknown
          expect_pub_id: unknown | null
          id: unknown
          spec: Json | null
          spec_type: Database["public"]["Enums"]["catalog_spec_type"] | null
          updated_at: string
          validated: Json | null
        }
        Insert: {
          built_spec?: Json | null
          catalog_name: string
          created_at?: string
          detail?: string | null
          draft_id: unknown
          expect_pub_id?: unknown | null
          id: unknown
          spec?: Json | null
          spec_type?: Database["public"]["Enums"]["catalog_spec_type"] | null
          updated_at?: string
          validated?: Json | null
        }
        Update: {
          built_spec?: Json | null
          catalog_name?: string
          created_at?: string
          detail?: string | null
          draft_id?: unknown
          expect_pub_id?: unknown | null
          id?: unknown
          spec?: Json | null
          spec_type?: Database["public"]["Enums"]["catalog_spec_type"] | null
          updated_at?: string
          validated?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "draft_specs_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "drafts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draft_specs_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "drafts_ext"
            referencedColumns: ["id"]
          },
        ]
      }
      drafts: {
        Row: {
          created_at: string
          detail: string | null
          id: unknown
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          detail?: string | null
          id: unknown
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          detail?: string | null
          id?: unknown
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "drafts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "drafts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      evolutions: {
        Row: {
          auto_publish: boolean
          background: boolean
          collections: Json
          created_at: string
          detail: string | null
          draft_id: unknown
          id: unknown
          job_status: Json
          logs_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_publish?: boolean
          background?: boolean
          collections: Json
          created_at?: string
          detail?: string | null
          draft_id: unknown
          id: unknown
          job_status?: Json
          logs_token?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          auto_publish?: boolean
          background?: boolean
          collections?: Json
          created_at?: string
          detail?: string | null
          draft_id?: unknown
          id?: unknown
          job_status?: Json
          logs_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evolutions_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "drafts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evolutions_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "drafts_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evolutions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "evolutions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_checkpoints_v1: {
        Row: {
          checkpoint: string
          fence: number
          key_begin: number
          key_end: number
          materialization: string
        }
        Insert: {
          checkpoint: string
          fence: number
          key_begin: number
          key_end: number
          materialization: string
        }
        Update: {
          checkpoint?: string
          fence?: number
          key_begin?: number
          key_end?: number
          materialization?: string
        }
        Relationships: []
      }
      flow_materializations_v2: {
        Row: {
          materialization: string
          spec: string
          version: string
        }
        Insert: {
          materialization: string
          spec: string
          version: string
        }
        Update: {
          materialization?: string
          spec?: string
          version?: string
        }
        Relationships: []
      }
      flow_watermarks: {
        Row: {
          slot: string
          watermark: string | null
        }
        Insert: {
          slot: string
          watermark?: string | null
        }
        Update: {
          slot?: string
          watermark?: string | null
        }
        Relationships: []
      }
      inferred_schemas: {
        Row: {
          collection_name: string
          flow_document: Json
          md5: string | null
          schema: Json
        }
        Insert: {
          collection_name: string
          flow_document: Json
          md5?: string | null
          schema: Json
        }
        Update: {
          collection_name?: string
          flow_document?: Json
          md5?: string | null
          schema?: Json
        }
        Relationships: []
      }
      live_spec_flows: {
        Row: {
          flow_type: Database["public"]["Enums"]["catalog_spec_type"]
          source_id: unknown
          target_id: unknown
        }
        Insert: {
          flow_type: Database["public"]["Enums"]["catalog_spec_type"]
          source_id: unknown
          target_id: unknown
        }
        Update: {
          flow_type?: Database["public"]["Enums"]["catalog_spec_type"]
          source_id?: unknown
          target_id?: unknown
        }
        Relationships: [
          {
            foreignKeyName: "live_spec_flows_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "live_specs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_spec_flows_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "live_specs_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_spec_flows_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "next_auto_discovers"
            referencedColumns: ["capture_id"]
          },
          {
            foreignKeyName: "live_spec_flows_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "live_specs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_spec_flows_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "live_specs_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_spec_flows_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "next_auto_discovers"
            referencedColumns: ["capture_id"]
          },
        ]
      }
      live_specs: {
        Row: {
          built_spec: Json | null
          catalog_name: string
          connector_image_name: string | null
          connector_image_tag: string | null
          created_at: string
          detail: string | null
          id: unknown
          inferred_schema_md5: string | null
          last_build_id: unknown
          last_pub_id: unknown
          md5: string | null
          reads_from: string[] | null
          spec: Json | null
          spec_type: Database["public"]["Enums"]["catalog_spec_type"] | null
          updated_at: string
          writes_to: string[] | null
        }
        Insert: {
          built_spec?: Json | null
          catalog_name: string
          connector_image_name?: string | null
          connector_image_tag?: string | null
          created_at?: string
          detail?: string | null
          id: unknown
          inferred_schema_md5?: string | null
          last_build_id: unknown
          last_pub_id: unknown
          md5?: string | null
          reads_from?: string[] | null
          spec?: Json | null
          spec_type?: Database["public"]["Enums"]["catalog_spec_type"] | null
          updated_at?: string
          writes_to?: string[] | null
        }
        Update: {
          built_spec?: Json | null
          catalog_name?: string
          connector_image_name?: string | null
          connector_image_tag?: string | null
          created_at?: string
          detail?: string | null
          id?: unknown
          inferred_schema_md5?: string | null
          last_build_id?: unknown
          last_pub_id?: unknown
          md5?: string | null
          reads_from?: string[] | null
          spec?: Json | null
          spec_type?: Database["public"]["Enums"]["catalog_spec_type"] | null
          updated_at?: string
          writes_to?: string[] | null
        }
        Relationships: []
      }
      old_catalog_stats: {
        Row: {
          bytes_read_by_me: number
          bytes_read_from_me: number
          bytes_written_by_me: number
          bytes_written_to_me: number
          catalog_name: string
          docs_read_by_me: number
          docs_read_from_me: number
          docs_written_by_me: number
          docs_written_to_me: number
          errors: number
          failures: number
          flow_document: Json
          grain: string
          ts: string
          warnings: number
        }
        Insert: {
          bytes_read_by_me: number
          bytes_read_from_me: number
          bytes_written_by_me: number
          bytes_written_to_me: number
          catalog_name: string
          docs_read_by_me: number
          docs_read_from_me: number
          docs_written_by_me: number
          docs_written_to_me: number
          errors?: number
          failures?: number
          flow_document: Json
          grain: string
          ts: string
          warnings?: number
        }
        Update: {
          bytes_read_by_me?: number
          bytes_read_from_me?: number
          bytes_written_by_me?: number
          bytes_written_to_me?: number
          catalog_name?: string
          docs_read_by_me?: number
          docs_read_from_me?: number
          docs_written_by_me?: number
          docs_written_to_me?: number
          errors?: number
          failures?: number
          flow_document?: Json
          grain?: string
          ts?: string
          warnings?: number
        }
        Relationships: []
      }
      publication_specs: {
        Row: {
          detail: string | null
          live_spec_id: unknown
          pub_id: unknown
          published_at: string
          spec: Json | null
          spec_type: Database["public"]["Enums"]["catalog_spec_type"] | null
          user_id: string
        }
        Insert: {
          detail?: string | null
          live_spec_id: unknown
          pub_id: unknown
          published_at?: string
          spec?: Json | null
          spec_type?: Database["public"]["Enums"]["catalog_spec_type"] | null
          user_id?: string
        }
        Update: {
          detail?: string | null
          live_spec_id?: unknown
          pub_id?: unknown
          published_at?: string
          spec?: Json | null
          spec_type?: Database["public"]["Enums"]["catalog_spec_type"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "publication_specs_live_spec_id_fkey"
            columns: ["live_spec_id"]
            isOneToOne: false
            referencedRelation: "live_specs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publication_specs_live_spec_id_fkey"
            columns: ["live_spec_id"]
            isOneToOne: false
            referencedRelation: "live_specs_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publication_specs_live_spec_id_fkey"
            columns: ["live_spec_id"]
            isOneToOne: false
            referencedRelation: "next_auto_discovers"
            referencedColumns: ["capture_id"]
          },
          {
            foreignKeyName: "publication_specs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "publication_specs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      publications: {
        Row: {
          auto_evolve: boolean
          background: boolean
          created_at: string
          detail: string | null
          draft_id: unknown
          dry_run: boolean
          id: unknown
          job_status: Json
          logs_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_evolve?: boolean
          background?: boolean
          created_at?: string
          detail?: string | null
          draft_id: unknown
          dry_run?: boolean
          id: unknown
          job_status?: Json
          logs_token?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          auto_evolve?: boolean
          background?: boolean
          created_at?: string
          detail?: string | null
          draft_id?: unknown
          dry_run?: boolean
          id?: unknown
          job_status?: Json
          logs_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "publications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "publications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      refresh_tokens: {
        Row: {
          created_at: string
          detail: string | null
          hash: string
          id: unknown
          multi_use: boolean | null
          updated_at: string
          user_id: string
          uses: number | null
          valid_for: unknown
        }
        Insert: {
          created_at?: string
          detail?: string | null
          hash: string
          id: unknown
          multi_use?: boolean | null
          updated_at?: string
          user_id: string
          uses?: number | null
          valid_for: unknown
        }
        Update: {
          created_at?: string
          detail?: string | null
          hash?: string
          id?: unknown
          multi_use?: boolean | null
          updated_at?: string
          user_id?: string
          uses?: number | null
          valid_for?: unknown
        }
        Relationships: [
          {
            foreignKeyName: "refresh_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "refresh_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      registered_avro_schemas: {
        Row: {
          avro_schema: Json
          avro_schema_md5: string | null
          catalog_name: string
          created_at: string
          detail: string | null
          id: unknown
          registry_id: number
          updated_at: string
        }
        Insert: {
          avro_schema: Json
          avro_schema_md5?: string | null
          catalog_name: string
          created_at?: string
          detail?: string | null
          id: unknown
          registry_id?: number
          updated_at?: string
        }
        Update: {
          avro_schema?: Json
          avro_schema_md5?: string | null
          catalog_name?: string
          created_at?: string
          detail?: string | null
          id?: unknown
          registry_id?: number
          updated_at?: string
        }
        Relationships: []
      }
      role_grants: {
        Row: {
          capability: Database["public"]["Enums"]["grant_capability"]
          created_at: string
          detail: string | null
          id: unknown
          object_role: string
          subject_role: string
          updated_at: string
        }
        Insert: {
          capability: Database["public"]["Enums"]["grant_capability"]
          created_at?: string
          detail?: string | null
          id: unknown
          object_role: string
          subject_role: string
          updated_at?: string
        }
        Update: {
          capability?: Database["public"]["Enums"]["grant_capability"]
          created_at?: string
          detail?: string | null
          id?: unknown
          object_role?: string
          subject_role?: string
          updated_at?: string
        }
        Relationships: []
      }
      storage_mappings: {
        Row: {
          catalog_prefix: string
          created_at: string
          detail: string | null
          id: unknown
          spec: Json
          updated_at: string
        }
        Insert: {
          catalog_prefix: string
          created_at?: string
          detail?: string | null
          id: unknown
          spec: Json
          updated_at?: string
        }
        Update: {
          catalog_prefix?: string
          created_at?: string
          detail?: string | null
          id?: unknown
          spec?: Json
          updated_at?: string
        }
        Relationships: []
      }
      tenants: {
        Row: {
          collections_quota: number
          created_at: string
          data_tiers: number[]
          detail: string | null
          gcm_account_id: string | null
          hide_preview: boolean
          id: unknown
          payment_provider:
            | Database["public"]["Enums"]["payment_provider_type"]
            | null
          recurring_usd_cents: number
          tasks_quota: number
          tenant: string
          trial_start: string | null
          updated_at: string
          usage_tiers: number[]
        }
        Insert: {
          collections_quota?: number
          created_at?: string
          data_tiers?: number[]
          detail?: string | null
          gcm_account_id?: string | null
          hide_preview?: boolean
          id: unknown
          payment_provider?:
            | Database["public"]["Enums"]["payment_provider_type"]
            | null
          recurring_usd_cents?: number
          tasks_quota?: number
          tenant: string
          trial_start?: string | null
          updated_at?: string
          usage_tiers?: number[]
        }
        Update: {
          collections_quota?: number
          created_at?: string
          data_tiers?: number[]
          detail?: string | null
          gcm_account_id?: string | null
          hide_preview?: boolean
          id?: unknown
          payment_provider?:
            | Database["public"]["Enums"]["payment_provider_type"]
            | null
          recurring_usd_cents?: number
          tasks_quota?: number
          tenant?: string
          trial_start?: string | null
          updated_at?: string
          usage_tiers?: number[]
        }
        Relationships: [
          {
            foreignKeyName: "tenants_gcm_account_id_fkey"
            columns: ["gcm_account_id"]
            isOneToOne: false
            referencedRelation: "gcm_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_grants: {
        Row: {
          capability: Database["public"]["Enums"]["grant_capability"]
          created_at: string
          detail: string | null
          id: unknown
          object_role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          capability: Database["public"]["Enums"]["grant_capability"]
          created_at?: string
          detail?: string | null
          id: unknown
          object_role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          capability?: Database["public"]["Enums"]["grant_capability"]
          created_at?: string
          detail?: string | null
          id?: unknown
          object_role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_grants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_grants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      alert_all: {
        Row: {
          alert_type: Database["public"]["Enums"]["alert_type"] | null
          arguments: Json | null
          catalog_name: string | null
          firing: boolean | null
        }
        Relationships: []
      }
      combined_grants_ext: {
        Row: {
          capability: Database["public"]["Enums"]["grant_capability"] | null
          created_at: string | null
          detail: string | null
          id: unknown | null
          object_role: string | null
          subject_role: string | null
          updated_at: string | null
          user_avatar_url: string | null
          user_email: string | null
          user_full_name: string | null
          user_id: string | null
        }
        Relationships: []
      }
      draft_specs_ext: {
        Row: {
          built_spec: Json | null
          catalog_name: string | null
          created_at: string | null
          detail: string | null
          draft_id: unknown | null
          draft_spec_md5: string | null
          expect_pub_id: unknown | null
          id: unknown | null
          inferred_schema_md5: string | null
          last_pub_detail: string | null
          last_pub_id: unknown | null
          last_pub_user_avatar_url: string | null
          last_pub_user_email: string | null
          last_pub_user_full_name: string | null
          last_pub_user_id: string | null
          live_inferred_schema_md5: string | null
          live_spec: Json | null
          live_spec_md5: string | null
          live_spec_type:
            | Database["public"]["Enums"]["catalog_spec_type"]
            | null
          spec: Json | null
          spec_type: Database["public"]["Enums"]["catalog_spec_type"] | null
          updated_at: string | null
          validated: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "draft_specs_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "drafts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draft_specs_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "drafts_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publication_specs_user_id_fkey"
            columns: ["last_pub_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publication_specs_user_id_fkey"
            columns: ["last_pub_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      drafts_ext: {
        Row: {
          created_at: string | null
          detail: string | null
          id: unknown | null
          num_specs: number | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drafts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drafts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      invoices_ext: {
        Row: {
          billed_prefix: string | null
          date_end: string | null
          date_start: string | null
          extra: Json | null
          invoice_type: string | null
          line_items: Json | null
          subtotal: number | null
        }
        Relationships: []
      }
      live_specs_ext: {
        Row: {
          built_spec: Json | null
          catalog_name: string | null
          connector_external_url: string | null
          connector_id: unknown | null
          connector_image_name: string | null
          connector_image_tag: string | null
          connector_logo_url: Json | null
          connector_recommended: boolean | null
          connector_short_description: Json | null
          connector_tag_documentation_url: string | null
          connector_tag_id: unknown | null
          connector_title: Json | null
          created_at: string | null
          detail: string | null
          id: unknown | null
          inferred_schema_md5: string | null
          last_build_id: unknown | null
          last_pub_detail: string | null
          last_pub_id: unknown | null
          last_pub_user_avatar_url: string | null
          last_pub_user_email: string | null
          last_pub_user_full_name: string | null
          last_pub_user_id: string | null
          md5: string | null
          reads_from: string[] | null
          spec: Json | null
          spec_type: Database["public"]["Enums"]["catalog_spec_type"] | null
          updated_at: string | null
          writes_to: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "publication_specs_user_id_fkey"
            columns: ["last_pub_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publication_specs_user_id_fkey"
            columns: ["last_pub_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      lock_monitor: {
        Row: {
          blocked_mode: string | null
          blocked_pid: number | null
          blocked_query: string | null
          blocking_mode: string | null
          blocking_pid: number | null
          blocking_query: string | null
          locked_item: string | null
          waiting_duration: unknown | null
        }
        Relationships: []
      }
      publication_specs_ext: {
        Row: {
          catalog_name: string | null
          detail: string | null
          last_pub_id: unknown | null
          live_spec_id: unknown | null
          pub_id: unknown | null
          published_at: string | null
          spec: Json | null
          spec_type: Database["public"]["Enums"]["catalog_spec_type"] | null
          user_avatar_url: string | null
          user_email: string | null
          user_full_name: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "publication_specs_live_spec_id_fkey"
            columns: ["live_spec_id"]
            isOneToOne: false
            referencedRelation: "live_specs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publication_specs_live_spec_id_fkey"
            columns: ["live_spec_id"]
            isOneToOne: false
            referencedRelation: "next_auto_discovers"
            referencedColumns: ["capture_id"]
          },
          {
            foreignKeyName: "publication_specs_live_spec_id_fkey"
            columns: ["live_spec_id"]
            isOneToOne: false
            referencedRelation: "live_specs_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publication_specs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publication_specs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      unchanged_draft_specs: {
        Row: {
          catalog_name: string | null
          draft_id: unknown | null
          draft_spec_md5: string | null
          inferred_schema_md5: string | null
          live_inferred_schema_md5: string | null
          live_spec_md5: string | null
          spec_type: Database["public"]["Enums"]["catalog_spec_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "draft_specs_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "drafts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draft_specs_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "drafts_ext"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      auth_roles: {
        Args: {
          min_capability?: Database["public"]["Enums"]["grant_capability"]
        }
        Returns: {
          role_prefix: unknown
          capability: Database["public"]["Enums"]["grant_capability"]
        }[]
      }
      auth_uid: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      billing_report_202308: {
        Args: {
          billed_prefix: unknown
          billed_month: string
          free_trial_range: unknown
        }
        Returns: Json
      }
      create_refresh_token: {
        Args: {
          multi_use: boolean
          valid_for: unknown
          detail?: string
        }
        Returns: Json
      }
      draft_collections_eligible_for_deletion: {
        Args: {
          capture_id: unknown
          draft_id: unknown
        }
        Returns: undefined
      }
      exchange_directive_token: {
        Args: {
          bearer_token: string
        }
        Returns: Database["public"]["CompositeTypes"]["exchanged_directive"]
      }
      gateway_auth_token: {
        Args: Record<PropertyKey, never>
        Returns: {
          token: string
          gateway_url: string
        }[]
      }
      generate_access_token: {
        Args: {
          refresh_token_id: unknown
          secret: string
        }
        Returns: Json
      }
      generate_opengraph_value: {
        Args: {
          opengraph_raw: Json
          opengraph_patch: Json
          field: string
        }
        Returns: unknown
      }
      prune_unchanged_draft_specs: {
        Args: {
          prune_draft_id: unknown
        }
        Returns: {
          catalog_name: unknown
          spec_type: Database["public"]["Enums"]["catalog_spec_type"]
          live_spec_md5: string
          draft_spec_md5: string
          inferred_schema_md5: string
          live_inferred_schema_md5: string
        }[]
      }
      republish_prefix: {
        Args: {
          prefix: unknown
        }
        Returns: unknown
      }
      tier_line_items: {
        Args: {
          amount: number
          tiers: number[]
          name: string
          unit: string
        }
        Returns: Json
      }
      view_logs: {
        Args: {
          bearer_token: string
        }
        Returns: unknown[]
      }
      view_user_profile: {
        Args: {
          bearer_user_id: string
        }
        Returns: Database["public"]["CompositeTypes"]["user_profile"]
      }
    }
    Enums: {
      alert_type:
        | "free_trial"
        | "free_trial_ending"
        | "free_trial_stalled"
        | "missing_payment_method"
        | "data_movement_stalled"
        | "data_not_processed_in_interval"
      catalog_spec_type: "capture" | "collection" | "materialization" | "test"
      grant_capability:
        | "x_00"
        | "x_01"
        | "x_02"
        | "x_03"
        | "x_04"
        | "x_05"
        | "x_06"
        | "x_07"
        | "x_08"
        | "x_09"
        | "read"
        | "x_11"
        | "x_12"
        | "x_13"
        | "x_14"
        | "x_15"
        | "x_16"
        | "x_17"
        | "x_18"
        | "x_19"
        | "write"
        | "x_21"
        | "x_22"
        | "x_23"
        | "x_24"
        | "x_25"
        | "x_26"
        | "x_27"
        | "x_28"
        | "x_29"
        | "admin"
      payment_provider_type: "stripe" | "external"
    }
    CompositeTypes: {
      alert_snapshot: {
        alert_type: Database["public"]["Enums"]["alert_type"] | null
        catalog_name: unknown | null
        arguments: Json | null
        firing: boolean | null
      }
      exchanged_directive: {
        directive: unknown
        applied_directive: unknown
      }
      user_profile: {
        user_id: string | null
        email: string | null
        full_name: string | null
        avatar_url: string | null
      }
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
