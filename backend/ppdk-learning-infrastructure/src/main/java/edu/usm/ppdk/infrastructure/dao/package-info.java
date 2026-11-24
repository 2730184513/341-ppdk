/**
 * Name database interfaces IXxxDao. Keep their SQL in the App module's mybatis/mapper directory.
 * Use IOrderDao for the DAO interface.
 * @Mapper and @Param require the Maven persistence dependency and an App data source. The database is disabled by default.
 * Use persistence objects only. In App mapper XML, set namespace to the full name of the corresponding DAO.
 * Examples are illustrative. Implement the collaborators and put each public type in its own file.
 */
package edu.usm.ppdk.infrastructure.dao;

/* BEGIN PACKAGE EXAMPLE
// This commented example is excluded from compilation and provides no runtime behavior or integration.
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import edu.usm.ppdk.infrastructure.dao.po.OrderPO;

@Mapper
public interface IOrderDao {
    OrderPO findById(@Param("orderId") String orderId);
    void save(@Param("order") OrderPO orderPO);
}
// Match mapper XML statement IDs to findById and save, and write SQL for the actual schema.
// Check the mapper scan scope after enabling the Maven persistence and Spring database configuration.
END PACKAGE EXAMPLE */
