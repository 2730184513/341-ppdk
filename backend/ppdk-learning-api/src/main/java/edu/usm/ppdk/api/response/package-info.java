/**
 * Placeholder for the public Response wrapper. Define its shape from the project contract without assuming status codes.
 * Use {@code Response<T>} for the generic response.
 * Use JDK Serializable only. Avoid dependencies on web and persistence frameworks.
 * Describe the public response shape here. Map business exceptions in the outer layer and keep service calls out of response classes.
 * Examples are illustrative. Implement the collaborators and put each public type in its own file.
 */
package edu.usm.ppdk.api.response;

/* BEGIN PACKAGE EXAMPLE
// This commented example is excluded from compilation and provides no runtime behavior or integration.
import java.io.Serializable;

public record Response<T>(String code, String message, T data) implements Serializable { }
END PACKAGE EXAMPLE */
