package org.drugis.addis.effectsTables;

import javax.persistence.*;
import java.io.Serializable;

/**
 * Created by joris on 4-4-17.
 */
@Entity @IdClass(EffectsTableAlternativeInclusion.PK.class)
public class EffectsTableAlternativeInclusion {

  static class PK implements Serializable {
    protected Integer analysisId;
    protected String alternativeId;

    public PK() {
    }

    public PK(Integer analysisId, String alternativeId) {
      this.analysisId = analysisId;
      this.alternativeId = alternativeId;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      PK pk = (PK) o;

      if (!analysisId.equals(pk.analysisId)) return false;
      return alternativeId.equals(pk.alternativeId);
    }

    @Override
    public int hashCode() {
      int result = analysisId.hashCode();
      result = 31 * result + alternativeId.hashCode();
      return result;
    }
  }

  @Id
  private Integer analysisId;
  @Id
  private String alternativeId;

  public EffectsTableAlternativeInclusion() {
  }

  public EffectsTableAlternativeInclusion(Integer analysisId, String alternativeId) {
    this.analysisId = analysisId;
    this.alternativeId = alternativeId;
  }

  public Integer getAnalysisId() {
    return analysisId;
  }

  public String getAlternativeId() {
    return alternativeId;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;

    EffectsTableAlternativeInclusion that = (EffectsTableAlternativeInclusion) o;

    if (!analysisId.equals(that.analysisId)) return false;
    return alternativeId.equals(that.alternativeId);
  }

  @Override
  public int hashCode() {
    int result = analysisId.hashCode();
    result = 31 * result + alternativeId.hashCode();
    return result;
  }
}
