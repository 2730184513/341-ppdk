/**
 * External protocol request and response DTOs are separate from domain models.
 * Use ProductRequestDTO and ProductResponseDTO for the example external protocol.
 * Use the JDK by default. Choose a serialization library for the provider's protocol and declare it explicitly.
 * Keep vendor-specific fields separate from public API DTOs. Let the port translate them into domain values.
 * Examples are illustrative. Implement the collaborators and put each public type in its own file.
 */
package edu.usm.ppdk.infrastructure.gateway.dto;

/* BEGIN PACKAGE EXAMPLE
// This commented example is excluded from compilation and provides no runtime behavior or integration.
public record ProductRequestDTO(String productId) { }
public record ProductResponseDTO(String productId, boolean active) { }
END PACKAGE EXAMPLE */
