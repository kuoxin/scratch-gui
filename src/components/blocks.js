const bindAll = require('lodash.bindall');
const defaultsDeep = require('lodash.defaultsdeep');
const React = require('react');
const ScratchBlocks = require('scratch-blocks');

class Blocks extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'attachVM',
            'detachVM',
            'onStackGlowOn',
            'onStackGlowOff',
            'onBlockGlowOn',
            'onBlockGlowOff',
            'onVisualReport',
            'onWorkspaceUpdate'
        ]);
    }
    componentDidMount () {
        let workspaceConfig = defaultsDeep({}, Blocks.defaultOptions, this.props.options);
        this.workspace = ScratchBlocks.inject(this.refs.scratchBlocks, workspaceConfig);
        this.attachVM();
    }
    componentWillUnmount () {
        this.detachVM();
        this.workspace.dispose();
    }
    attachVM () {
        this.workspace.addChangeListener(this.props.vm.blockListener);
        this.workspace.getFlyout().getWorkspace().addChangeListener(
            this.props.vm.flyoutBlockListener
        );
        this.props.vm.on('STACK_GLOW_ON', this.onStackGlowOn);
        this.props.vm.on('STACK_GLOW_OFF', this.onStackGlowOff);
        this.props.vm.on('BLOCK_GLOW_ON', this.onBlockGlowOn);
        this.props.vm.on('BLOCK_GLOW_OFF', this.onBlockGlowOff);
        this.props.vm.on('VISUAL_REPORT', this.onVisualReport);
        this.props.vm.on('workspaceUpdate', this.onWorkspaceUpdate);
    }
    detachVM () {
        this.props.vm.off('STACK_GLOW_ON', this.onStackGlowOn);
        this.props.vm.off('STACK_GLOW_OFF', this.onStackGlowOff);
        this.props.vm.off('BLOCK_GLOW_ON', this.onBlockGlowOn);
        this.props.vm.off('BLOCK_GLOW_OFF', this.onBlockGlowOff);
        this.props.vm.off('VISUAL_REPORT', this.onVisualReport);
        this.props.vm.off('workspaceUpdate', this.onWorkspaceUpdate);
    }
    onStackGlowOn (data) {
        this.workspace.glowStack(data.id, true);
    }
    onStackGlowOff (data) {
        this.workspace.glowStack(data.id, false);
    }
    onBlockGlowOn (data) {
        this.workspace.glowBlock(data.id, true);
    }
    onBlockGlowOff (data) {
        this.workspace.glowBlock(data.id, false);
    }
    onVisualReport (data) {
        this.workspace.reportValue(data.id, data.value);
    }
    onWorkspaceUpdate (data) {
        ScratchBlocks.Events.disable();
        this.workspace.clear();
        let dom = ScratchBlocks.Xml.textToDom(data.xml);
        ScratchBlocks.Xml.domToWorkspace(dom, this.workspace);
        ScratchBlocks.Events.enable();
    }
    render () {
        return (
            <div
                className="scratch-blocks"
                ref="scratchBlocks"
                style={{
                    position: 'absolute',
                    top: 0,
                    right: '40%',
                    bottom: 0,
                    left: 0
                }}
            />
        );
    }
}

Blocks.propTypes = {
    options: React.PropTypes.shape({
        media: React.PropTypes.string,
        zoom: React.PropTypes.shape({
            controls: React.PropTypes.boolean,
            wheel: React.PropTypes.boolean,
            startScale: React.PropTypes.number
        }),
        colours: React.PropTypes.shape({
            workspace: React.PropTypes.string,
            flyout: React.PropTypes.string,
            scrollbar: React.PropTypes.string,
            scrollbarHover: React.PropTypes.string,
            insertionMarker: React.PropTypes.string,
            insertionMarkerOpacity: React.PropTypes.number,
            fieldShadow: React.PropTypes.string,
            dragShadowOpacity: React.PropTypes.number
        })
    }),
    vm: React.PropTypes.object
};

Blocks.defaultOptions = {
    zoom: {
        controls: true,
        wheel: true,
        startScale: 0.75
    },
    colours: {
        workspace: '#334771',
        flyout: '#283856',
        scrollbar: '#24324D',
        scrollbarHover: '#0C111A',
        insertionMarker: '#FFFFFF',
        insertionMarkerOpacity: 0.3,
        fieldShadow: 'rgba(255, 255, 255, 0.3)',
        dragShadowOpacity: 0.6
    }
};

Blocks.defaultProps = {
    options: Blocks.defaultOptions
};

module.exports = Blocks;