<?xml-stylesheet type="text/xsl"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://mapsforge.org/renderTheme" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<!-- 
# OpenHikingMap
#
# Polynom rendering: Buildings
#
# Copyright (c) 2022-2024 OpenHiking contributors
# SPDX-License-Identifier: GPL-3.0-only
-->

<!-- Building colors — ČÚZK SM5: building fill 227,227,227 = #E3E3E3, outline #707070 -->
<xsl:template name="poly-buildings">
<rule cat="buildings" e="way" k="building" v="*" zoom-min="14" closed="yes">
   <!-- Generic building — mapy.cz: #EDE5CC warm beige -->
   <rule e="way" k="building" v="yes">
      <area fill="#EDE5CC" stroke="#808080" stroke-width="0.6" scale="none" />
    </rule>
    <rule e="way" k="building" v="supermarket">
      <area fill="#E8D4DC" stroke="#808080" stroke-width="0.6" scale="none" />
    </rule>
    <!-- Religious buildings — warm golden tan, visible landmark -->
    <rule e="way" k="building" v="chapel|church|cathedral|basicila|monastry|mosque|synagogue">
      <area fill="#E4C498" stroke="#806040" stroke-width="1.6" scale="none" />
    </rule>
    <rule e="way" k="building" v="museum">
      <area fill="#DCC0C0" stroke="#808080" stroke-width="0.6" scale="none" />
    </rule>
    <rule e="way" k="building" v="public|education|hospital|transportation">
      <area fill="#ccc2b1" stroke="#808080" stroke-width="0.6" scale="none" />
    </rule>
    <rule e="way" k="building" v="sports_centre">
      <area fill="#C8D8E0" stroke="#4080A0" stroke-width="1" scale="none" />
    </rule>
    <rule e="way" k="building" v="swimming_facility">
      <area fill="#A8D8E8" stroke="#4080A0" stroke-width="0.6" scale="none" />
     </rule>
   <!-- Historic buildings — warm rust tone -->
   <rule e="way" k="building" v="historic">
      <area fill="#D4A890" stroke="#804030" stroke-width="0.6" scale="none" />
    </rule>
</rule>
</xsl:template>
</xsl:stylesheet>