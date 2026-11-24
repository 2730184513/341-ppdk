/**
 * Infrastructure-specific bean configuration. The app/config package owns startup and assembly of optional integrations.
 * Use GatewayConfiguration for the technical configuration.
 * Use @Configuration, @Bean, and @Profile from Spring Context to assemble infrastructure-specific objects.
 * Configure technical clients here. Use profiles and supply a URI and protocol decoder without registering duplicate beans.
 * Examples are illustrative. Implement the collaborators and put each public type in its own file.
 */
package edu.usm.ppdk.infrastructure.config;

/* BEGIN PACKAGE EXAMPLE
// This commented example is excluded from compilation and provides no runtime behavior or integration.
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import java.net.URI;
import java.net.http.HttpClient;
import java.time.Duration;
import edu.usm.ppdk.infrastructure.gateway.ProductGatewayService;
import edu.usm.ppdk.infrastructure.gateway.IProductResponseDecoder;

@Configuration(proxyBeanMethods = false)
@Profile("product")
public class GatewayConfiguration {
    @Bean
    public ProductGatewayService productGatewayService(Environment environment, IProductResponseDecoder decoder) {
        var client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();
        var baseUri = URI.create(environment.getRequiredProperty("integrations.product.base-uri"));
        // Configure a valid external service base URI and agree on trailing slash handling and access scope.
        return new ProductGatewayService(client, baseUri, decoder);
    }
}
END PACKAGE EXAMPLE */
