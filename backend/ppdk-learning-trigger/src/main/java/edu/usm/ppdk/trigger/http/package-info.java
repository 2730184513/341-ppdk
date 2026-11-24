/**
 * HTTP controllers call use-case interfaces without direct access to the domain or DAO.
 * Use OrderController for the example HTTP entry point.
 * Use the Spring Web annotations. Declare the validation dependency before adding validation annotations.
 * Handle HTTP routing and protocol mapping here and delegate business orchestration to Case.
 * Examples are illustrative. Implement the collaborators and put each public type in its own file.
 */
package edu.usm.ppdk.trigger.http;

/* BEGIN PACKAGE EXAMPLE
// This commented example is excluded from compilation and provides no runtime behavior or integration.
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import edu.usm.ppdk.cases.xxx.IOrderCase;
import edu.usm.ppdk.api.dto.OrderQueryRequestDTO;
import edu.usm.ppdk.api.dto.OrderResponseDTO;
import edu.usm.ppdk.api.response.Response;

@RestController
@RequestMapping("/orders")
public final class OrderController {
    private final IOrderCase orderCase;
    public OrderController(IOrderCase orderCase) { this.orderCase = orderCase; }
    @PostMapping("/query")
    public Response<OrderResponseDTO> query(@RequestBody OrderQueryRequestDTO request) {
        return orderCase.query(request);
    }
}
END PACKAGE EXAMPLE */
