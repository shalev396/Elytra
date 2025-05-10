/**
 * Project type options
 */
export type ProjectType =
  | "E-Commerce"
  | "SaaS"
  | "CMS"
  | "Social Network"
  | "Portfolio";

/**
 * Platform options
 */
export type Platform = "Web" | "Desktop" | "Mobile";

/**
 * Frontend type options
 */
export type FrontendType = "SPA" | "SSR" | "Both";

/**
 * Frontend framework options for SPA
 */
export type SPAFramework =
  | "React.js"
  | "Angular"
  | "Vue.js"
  | "Svelte"
  | "Ember.js"
  | "Backbone.js"
  | "Mithril.js"
  | "Preact"
  | "Solid.js"
  | "Alpine.js"
  | "Lit"
  | "Meteor.js"
  | "Knockout.js"
  | "Dojo Toolkit"
  | "Ext JS"
  | "Avalonia"
  | "Blazor WebAssembly"
  | "Flutter Web"
  | "OpenSilver"
  | "Uno Platform";

/**
 * Backend language options
 */
export type BackendLanguage =
  | "JavaScript / TypeScript"
  | "Python"
  | "Java"
  | "PHP"
  | "Ruby"
  | "Go"
  | "Other";

/**
 * Backend framework options for JavaScript/TypeScript
 */
export type JSBackendFramework =
  | "Express.js"
  | "Koa.js"
  | "NestJS"
  | "Fastify"
  | "Hapi.js"
  | "Sails.js"
  | "Feathers.js"
  | "LoopBack"
  | "Total.js"
  | "AdonisJS"
  | "Meteor.js"
  | "ActionHero.js";

/**
 * Database type options
 */
export type DatabaseType =
  | "SQL"
  | "Document-Oriented Databases"
  | "Key-Value Stores"
  | "Column-Oriented Databases"
  | "Graph Databases"
  | "Time-Series Databases"
  | "Object-Oriented Databases"
  | "Hierarchical Databases"
  | "Network Databases"
  | "Cloud Databases"
  | "Multi-Model Databases"
  | "NewSQL Databases";

/**
 * SQL Database options
 */
export type SQLDatabase =
  | "MySQL"
  | "PostgreSQL"
  | "Oracle Database"
  | "Microsoft SQL Server"
  | "IBM Db2";

/**
 * Framework with enabled flag for display
 */
export interface FrameworkOption {
  id: string;
  name: string;
  enabled: boolean;
}

/**
 * Project configuration
 */
export interface ProjectConfig {
  projectName: string;
  projectDescription: string;
  projectType: ProjectType;
  platform: Platform;
  frontendType: FrontendType;
  frontendFramework: SPAFramework;
  backendLanguage: BackendLanguage;
  backendFramework: JSBackendFramework;
  databaseType: DatabaseType;
  database: SQLDatabase;
}
