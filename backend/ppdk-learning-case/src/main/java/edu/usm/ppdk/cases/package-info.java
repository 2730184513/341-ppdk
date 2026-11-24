/**
 * Group use-case interfaces and implementations by business domain. Use API contracts to coordinate domain services.
 * Name use-case interfaces IXxxCase and implementations XxxCaseImpl.
 * Depend on API contracts, domain interfaces, and shared types. Implementations may use the declared Spring Context and Tx dependencies.
 * Use this parent package for organization. Place concrete use cases in business packages and add workflow nodes or factories as needed.
 * Examples are illustrative. Implement the collaborators and put each public type in its own file.
 */
package edu.usm.ppdk.cases;

/* BEGIN PACKAGE EXAMPLE
// This commented example is excluded from compilation and provides no runtime behavior or integration.
// Interface location: cases.xxx.IOrderCase.
import edu.usm.ppdk.api.dto.OrderQueryRequestDTO;
import edu.usm.ppdk.api.dto.OrderResponseDTO;
import edu.usm.ppdk.api.response.Response;

public interface IOrderCase {
    Response<OrderResponseDTO> query(OrderQueryRequestDTO request);
}
END PACKAGE EXAMPLE */
