/**
 * This package contains a small set of shared framework-independent types.
 * Use ITraceIdProvider for the example shared interface.
 * Depend only on the JDK and avoid business module and framework dependencies.
 * Extract only types genuinely shared across modules. Keep business models in Domain.
 * Examples are illustrative. Implement the collaborators and put each public type in its own file.
 */
package edu.usm.ppdk.types;

/* BEGIN PACKAGE EXAMPLE
// This commented example is excluded from compilation and provides no runtime behavior or integration.
public interface ITraceIdProvider {
    String currentTraceId();
}
END PACKAGE EXAMPLE */
