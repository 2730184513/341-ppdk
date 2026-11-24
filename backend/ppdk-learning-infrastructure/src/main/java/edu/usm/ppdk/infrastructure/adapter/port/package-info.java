/**
 * Implement domain ports and use the gateway to access external systems.
 * Use ProductPort implements IProductPort for the external adapter and omit the Impl suffix.
 * Use @Component and inject the gateway through the constructor. Depend on the domain port and keep third-party DTOs internal.
 * Isolate protocol details and map failures. Restore interrupt status and propagate failures instead of substituting fake data.
 * Examples are illustrative. Implement the collaborators and put each public type in its own file.
 */
package edu.usm.ppdk.infrastructure.adapter.port;

/* BEGIN PACKAGE EXAMPLE
// This commented example is excluded from compilation and provides no runtime behavior or integration.
import org.springframework.stereotype.Component;
import java.io.IOException;
import edu.usm.ppdk.domain.yyy.adapter.port.IProductPort;
import edu.usm.ppdk.infrastructure.gateway.ProductGatewayService;

@Component
public class ProductPort implements IProductPort {
    private final ProductGatewayService gatewayService;
    public ProductPort(ProductGatewayService gatewayService) { this.gatewayService = gatewayService; }
    @Override
    public boolean isActive(String productId) {
        try {
            return gatewayService.queryProduct(productId).active();
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Product query interrupted", exception);
        } catch (IOException exception) {
            throw new IllegalStateException("Product query failed", exception);
        }
    }
}
END PACKAGE EXAMPLE */
