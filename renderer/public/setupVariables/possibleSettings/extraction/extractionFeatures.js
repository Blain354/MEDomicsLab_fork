const extractionFeatures = {
  morphological: {
    MEDimageName: "morph",
    associatedFeatures: {
      "Area density aabb": "a_dens_aabb",
      "Area density aee": "a_dens_aee",
      "Area density convex hull": "a_dens_conv_hull",
      "Area density mvee": "a_dens_mvee",
      "Area density ombb": "a_dens_ombb",
      "Approximate volume": "approx_vol",
      "Surface area": "area",
      Asphericity: "asphericity",
      "Surface to volume ratio": "av",
      "Centre of mass shift": "com",
      "Compactness 1": "comp_1",
      "Compactness 2": "comp_2",
      "Maximum 3d diameter": "diam",
      "Geary's C measure": "geary_c",
      "Integrated intensity": "integ_int",
      "Moran's I index": "moran_i",
      Elongation: "pca_elongation",
      Flatness: "pca_flatness",
      "Least axis length": "pca_least",
      "Major axis length": "pca_major",
      "Minor axis length": "pca_minor",
      "Spherical disproportion": "sph_dispr",
      Sphericity: "sphericity",
      "Volume density aabb": "v_dens_aabb",
      "Volume density aee": "v_dens_aee",
      "Volume density - convex hull": "v_dens_conv_hull",
      "Volume density mvee": "v_dens_mvee",
      "Volume density ombb": "v_dens_ombb",
      Volume: "vol",
    },
  },
  local_intensity: {
    MEDimageName: "local_intensity",
    associatedFeatures: {
      "Global intensity peak": "peak_global",
      "Local intensity peak": "peak_local",
    },
  },
  statistical: {
    MEDimageName: "stats",
    associatedFeatures: {
      "Coefficient of variation": "cov",
      Energy: "energy",
      "Interquartile range": "iqrange",
      Kurtosis: "kurt",
      "Mean absolute deviation": "mad",
      "Maximum grey level": "max",
      Mean: "mean",
      "Median absolute deviation": "medad",
      Median: "median",
      "Minimum grey level": "min",
      "Score at 10th percentile": "p10",
      "Score at 90th percentile": "p90",
      "Quartile coefficient of dispersion": "qcod",
      "Range of values (maximum - minimum)": "range",
      "Robust mean absolute deviation": "rmad",
      "Root mean square": "rms",
      "Sample skewness": "skewness",
      "Statistical variance": "var",
    },
  },
  intensity_histogram: {
    MEDimageName: "intensity_histogram",
    associatedFeatures: {
      "Coefficient of variation": "cov",
      Entropy: "entropy",
      "Interquartile range": "iqrange",
      Kurtosis: "kurt",
      "Mean absolute deviation": "mad",
      "Maximum grey level": "max",
      "Maximum histogram gradient": "max_grad",
      "Maximum histogram gradient grey level": "max_grad_gl",
      Mean: "mean",
      "Median absolute deviation": "medad",
      Median: "median",
      "Minimum grey level": "min",
      "Minimum histogram gradient": "min_grad",
      "Minimum histogram gradient grey level": "min_grad_gl",
      Mode: "mode",
      "10th percentile": "p10",
      "90th percentile": "p90",
      "Quartile coefficient of dispersion": "qcod",
      Range: "range",
      "Robust mean absolute deviation": "rmad",
      Skewness: "skewness",
      Uniformity: "uniformity",
      Variance: "var",
    },
  },
  ivh: {
    MEDimageName: "int_vol_hist",
    associatedFeatures: {
      "Intensity at volume fraction 10": "i10",
      "Intensity at volume fraction difference": "i10_minus_i90",
      "Intensity at volume fraction 90": "i90",
      "Volume at intensity fraction 10": "v10",
      "Volume at intensity fraction difference": "v10_minus_v90",
      "Volume at intensity fraction 90": "v90",
    },
  },
  glcm: {
    MEDimageName: "glcm",
    associatedFeatures: {
      Autocorrelation: "auto_corr",
      "Cluster prominence": "clust_prom",
      "Cluster shade": "clust_shade",
      "Cluster tendency": "clust_tend",
      Contrast: "contrast",
      Correlation: "corr",
      "Difference average": "diff_avg",
      "Difference entropy": "diff_entr",
      "Difference variance": "diff_var",
      Dissimilarity: "dissimilarity",
      "Angular second moment": "energy",
      "Information correlation 1": "info_corr1",
      "Information correlation 2": "info_corr2",
      "Inverse difference": "inv_diff",
      "Inverse difference moment": "inv_diff_mom",
      "Inverse difference moment normalized": "inv_diff_mom_norm",
      "Inverse difference normalized": "inv_diff_norm",
      "Inverse variance": "inv_var",
      "Joint average": "joint_avg",
      "Joint entropy": "joint_entr",
      "Joint maximum": "joint_max",
      "Joint variance": "joint_var",
      "Sum average": "sum_avg",
      "Sum entropy": "sum_entr",
      "Sum variance": "sum_var",
    },
  },
  gldzm: {
    MEDimageName: "gldzm",
    associatedFeatures: {
      "Grey level variance": "gl_var",
      "Grey level non-uniformity": "glnu",
      "Grey level non-uniformity normalised": "glnu_norm",
      "High grey level zone emphasis": "hgze",
      "Large distance emphasis": "lde",
      "Large distance high grey level emphasis": "ldhge",
      "Large distance low grey level emphasis": "ldlge",
      "Low grey level zone emphasis": "lgze",
      "Small distance emphasis": "sde",
      "Small distance high grey level emphasis": "sdhge",
      "Small distance low grey level emphasis": "sdlge",
      "Zone percentage": "z_perc",
      "Zone distance entropy": "zd_entr",
      "Zone distance variance": "zd_var",
      "Zone distance non-uniformity": "zdnu",
      "Zone distance non-uniformity normalised": "zdnu_norm",
    },
  },
  glrlm: {
    MEDimageName: "glrlm",
    associatedFeatures: {
      "Grey level variance": "gl_var",
      "Grey level non-uniformity": "glnu",
      "Grey level non-uniformity normalised": "glnu_norm",
      "High grey level run emphasis": "hgre",
      "Low grey level run emphasis": "lgre",
      "Long runs emphasis": "lre",
      "Long run high grey level emphasis": "lrhge",
      "Long run low grey level emphasis": "lrlge",
      "Run percentage": "r_perc",
      "Run entropy": "rl_entr",
      "Run length variance": "rl_var",
      "Run length non-uniformity": "rlnu",
      "Run length non-uniformity normalised": "rlnu_norm",
      "Short runs emphasis": "sre",
      "Short run high grey level emphasis": "srhge",
      "Short run low grey level emphasis": "srlge",
    },
  },
  glszm: {
    MEDimageName: "glszm",
    associatedFeatures: {
      "Grey level variance": "gl_var",
      "Grey level non-uniformity": "glnu",
      "Grey level non-uniformity normalised": "glnu_norm",
      "High grey level zone emphasis": "hgze",
      "Low grey level zone emphasis": "lgze",
      "Large zone emphasis": "lze",
      "Large zone high grey level emphasis": "lzhge",
      "Large zone low grey level emphasis": "lzlge",
      "Small zone emphasis": "sze",
      "Small zone high grey level emphasis": "szhge",
      "Small zone low grey level emphasis": "szlge",
      "Zone percentage": "z_perc",
      "Zone size entropy": "zs_entr",
      "Zone size variance": "zs_var",
      "Zone size non-uniformity": "zsnu",
      "Zone size non-uniformity normalised": "zsnu_norm",
    },
  },
  ngldm: {
    MEDimageName: "ngldm",
    associatedFeatures: {
      "Dependence count energy": "dc_energy",
      "Dependence count entropy": "dc_entr",
      "Dependence count variance": "dc_var",
      "Dependence count non-uniformity": "dcnu",
      "Dependence count non-uniformity normalised": "dcnu_norm",
      "Grey level variance": "gl_var",
      "Grey level non-uniformity": "glnu",
      "Grey level non-uniformity normalised": "glnu_norm",
      "High dependence emphasis": "hde",
      "High dependence high grey level emphasis": "hdhge",
      "High dependence low grey level emphasis": "hdlge",
      "High grey level count emphasis": "hgce",
      "Low dependence emphasis": "lde",
      "Low dependence high grey level emphasis": "ldhge",
      "Low dependence low grey level emphasis": "ldlge",
      "Low grey level count emphasis": "lgce",
    },
  },
  ngtdm: {
    MEDimageName: "ngtdm",
    associatedFeatures: {
      Busyness: "busyness",
      Coarseness: "coarseness",
      Complexity: "complexity",
      Contrast: "contrast",
      Strength: "strength",
    },
  },
};

export default extractionFeatures;
