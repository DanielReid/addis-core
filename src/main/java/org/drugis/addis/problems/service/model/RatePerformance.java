package org.drugis.addis.problems.service.model;

import java.util.Objects;

/**
 * Created by daan on 3/26/14.
 */
public class RatePerformance extends AbstractPerformance {
  public static final String DBETA = "dbeta";
  private RatePerformanceParameters parameters;

  public RatePerformance(RatePerformanceParameters parameters) {
    this.parameters = parameters;
  }

  @Override
  public String getType() {
    return DBETA;
  }

  @Override
  public RatePerformanceParameters getParameters() {
    return this.parameters;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    RatePerformance that = (RatePerformance) o;
    return Objects.equals(parameters, that.parameters);
  }

  @Override
  public int hashCode() {
    return Objects.hash(parameters);
  }
}
