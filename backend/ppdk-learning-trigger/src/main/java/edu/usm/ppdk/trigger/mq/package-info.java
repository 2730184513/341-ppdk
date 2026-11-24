/**
 * Message listeners map protocol input and delegate to Case or Domain for business idempotency.
 * Use OrderListener for the example listener.
 * @Component registers the bean. Declare the selected message broker's annotations and SDK explicitly.
 * Decode the message and invoke the case. The message adapter owns acknowledgement and retry behavior.
 * Examples are illustrative. Implement the collaborators and put each public type in its own file.
 */
package edu.usm.ppdk.trigger.mq;

/* BEGIN PACKAGE EXAMPLE
// This commented example is excluded from compilation and provides no runtime behavior or integration.
import org.springframework.stereotype.Component;
import edu.usm.ppdk.cases.xxx.IOrderCase;
import edu.usm.ppdk.api.dto.OrderQueryRequestDTO;
import edu.usm.ppdk.api.dto.OrderResponseDTO;
import edu.usm.ppdk.api.response.Response;

@Component
public class OrderListener {
    private final IOrderCase orderCase;
    public OrderListener(IOrderCase orderCase) { this.orderCase = orderCase; }
    // This method is not attached to a broker. Once configured, decode the broker's message type and acknowledge only successful processing.
    public Response<OrderResponseDTO> onMessage(OrderQueryRequestDTO request) {
        return orderCase.query(request);
    }
}
END PACKAGE EXAMPLE */
