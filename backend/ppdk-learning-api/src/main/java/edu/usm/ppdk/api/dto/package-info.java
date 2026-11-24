/**
 * Request and response DTOs shared by the trigger and case modules.
 * Name input DTOs XxxRequestDTO and output DTOs XxxResponseDTO.
 * The example uses a Java 21 record with no framework annotations. Declare any validation dependency before adding its annotations.
 * Use separate files for these types and keep domain entities, persistence objects, and business rules out of transport DTOs.
 * Examples are illustrative. Implement the collaborators and put each public type in its own file.
 */
package edu.usm.ppdk.api.dto;

/* BEGIN PACKAGE EXAMPLE
// This commented example is excluded from compilation and provides no runtime behavior or integration.
public record OrderQueryRequestDTO(String orderId) { }
public record OrderResponseDTO(String orderId, String status, int availableQuantity) { }
public record InventoryQueryRequestDTO(String productId) { }
public record InventoryResponseDTO(String productId, int availableQuantity) { }
END PACKAGE EXAMPLE */
