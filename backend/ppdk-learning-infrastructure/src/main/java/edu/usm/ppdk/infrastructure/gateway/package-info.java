/**
 * HTTP and RPC clients used by adapter/port.
 * Use ProductGatewayService for the external client.
 * Use JDK HttpClient, external DTOs, and a protocol decoder. Assemble the client bean in config or App.
 * Handle outbound requests, timeouts, and protocol responses. Implement the decoder, read the URI from configuration, and keep domain rules outside the gateway.
 * Examples are illustrative. Implement the collaborators and put each public type in its own file.
 */
package edu.usm.ppdk.infrastructure.gateway;

/* BEGIN PACKAGE EXAMPLE
// This commented example is excluded from compilation and provides no runtime behavior or integration.
import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import edu.usm.ppdk.infrastructure.gateway.dto.ProductResponseDTO;

public final class ProductGatewayService {
    private final HttpClient client;
    private final URI baseUri;
    private final IProductResponseDecoder decoder;
    public ProductGatewayService(HttpClient client, URI baseUri, IProductResponseDecoder decoder) {
        this.client = client;
        this.baseUri = baseUri;
        this.decoder = decoder;
    }
    public ProductResponseDTO queryProduct(String productId) throws IOException, InterruptedException {
        String encodedId = URLEncoder.encode(productId, StandardCharsets.UTF_8);
        var request = HttpRequest.newBuilder(baseUri.resolve("products/" + encodedId))
                .timeout(Duration.ofSeconds(5)).GET().build();
        var response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) { throw new IOException("Product service returned an unexpected status"); }
        return decoder.decode(response.body());
    }
}
// Place example collaborators in separate files. Parse the actual protocol with a declared library and validate response data.
public interface IProductResponseDecoder {
    ProductResponseDTO decode(String responseBody) throws IOException;
}
END PACKAGE EXAMPLE */
