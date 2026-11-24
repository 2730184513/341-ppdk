/**
 * Name database mapping objects XxxPO and keep them out of public API contracts.
 * Use OrderPO for the database mapping object.
 * Use a JDK record. Declare any Lombok dependency explicitly before using its annotations.
 * Represent database columns and values here. Design mapper statements, constructor mapping, and optimistic locking for the real schema.
 * Examples are illustrative. Implement the collaborators and put each public type in its own file.
 */
package edu.usm.ppdk.infrastructure.dao.po;

/* BEGIN PACKAGE EXAMPLE
// This commented example is excluded from compilation and provides no runtime behavior or integration.
public record OrderPO(String orderId, String productId, String status, long version) { }
END PACKAGE EXAMPLE */
