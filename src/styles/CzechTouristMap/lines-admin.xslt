<?xml-stylesheet type="text/xsl"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://mapsforge.org/renderTheme" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<!-- 
# OpenHikingMap
#
# Lines rendering: Administrative boundaries
#
# Copyright (c) 2022-2024 OpenHiking contributors
# SPDX-License-Identifier: GPL-3.0-only
-->

<!-- Administrative boundaries — ČÚZK SM5: admin boundaries = RGB 255,76,255 = #FF4CFF (magenta) -->
<!-- State/national boundary uses classic Czech cartographic style: thick magenta-pink with dash -->
<xsl:template name="lines-admin">

<rule  e="way" k="boundary" v="administrative"  zoom-min="6">
    <!-- State border (admin_level=2) — solid magenta-pink, SM5: #FF4CFF -->
    <rule  e="way" k="admin_level" v="2">
        <rule e="way" k="*" v="*" zoom-max="13">
            <line stroke="#E040C0" stroke-width="2"/>
        </rule>
        <rule e="way" k="*" v="*" zoom-min="14" zoom-max="14">
            <line stroke="#C030A0" stroke-width="2.5"/>
        </rule>
        <rule e="way" k="*" v="*" zoom-min="15">
            <line stroke="#C030A0" stroke-width="3"/>
            <line stroke="#FF4CFF" stroke-width="0.4" stroke-dasharray="0.4,2,2,2" scale="all" />
        </rule>
    </rule>
    <!-- Regional/kraj border (admin_level=3/4) — thinner, lighter magenta -->
    <rule  cat="region_border" e="way" k="admin_level" v="3">
        <line stroke="#C030A050" stroke-width="1.5"/>
        <line stroke="#D060C0" stroke-width="0.3" stroke-dasharray="0.4,2,2,2" scale="all" />
    </rule>
</rule>

</xsl:template>
</xsl:stylesheet>